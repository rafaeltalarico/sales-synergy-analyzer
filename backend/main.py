from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, APIRouter
from openai import OpenAI
from pydantic import BaseModel
from enum import Enum
from typing import List, Dict, Any
import json
from datetime import datetime
from fastapi.responses import JSONResponse
import boto3
 

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter() 
app = FastAPI(title="Sales Synergy API")
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME")
}

router = APIRouter()
AWS_ACCOUNT_ID = "160433694706"
DASHBOARD_ID = "ff0ef14b-8442-4b47-b268-350dfcf50839"
AWS_REGION = "us-east-1"
QUICKSIGHT_USER = "rpaulista80@gmail.com"

def get_db_connection():
    try:
        conn = psycopg2.connect(
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            sslmode='require',
            cursor_factory=RealDictCursor
        )
        print("Conexão com o banco estabelecida com sucesso!")
        return conn
    except psycopg2.OperationalError as e:
        print(f"Erro operacional ao conectar ao banco: {e}")
        raise HTTPException(status_code=500, detail=f"Erro de conexão com o banco: {e}")
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        raise HTTPException(status_code=500, detail="Erro de conexão com o banco de dados")

class PerguntaRequest(BaseModel):
    pergunta: str

class Product(BaseModel):
    id_produto: int
    nome_produto: str
    preco: float

class Purchase(BaseModel):
    id_compra: int
    data_compra: str
    cpf: str

class PurchaseItem(BaseModel):
    id: int
    id_compra: int
    id_produto: int
    valor_unitario: float
    encarte: Optional[str] = None

class RelatedProductData(BaseModel):
    productName: str
    occurrences: int
    percentage: int
    absoluteValue: int

class SalesDifference(BaseModel):
    percentage: int
    absoluteValue: int
    isIncrease: bool

class SalesAnalysis(BaseModel):
    productId: int
    productName: str
    startDateSales: int
    endDateSales: int
    salesDifference: SalesDifference
    relatedProducts: List[RelatedProductData]
    showComparison: bool

class ProductInsightMetric(BaseModel):
    value: float
    unit: str
    change: Optional[float] = None

class ProductInsight(BaseModel):
    title: str
    description: str
    type: str # 'positive', 'negative', 'suggestion', 'neutral'
    metric: Optional[ProductInsightMetric] = None

class AIInsightsResponse(BaseModel):
    summary: str
    insights: List[ProductInsight]

class AnalysisType(str, Enum):
    SALES_SUMMARY = "summary"
    SALES_COMPARISON = "comparison"
    PERIOD_COMPARISON = "period_comparison"

class AnalyticsResponse(BaseModel):
    total_vendido: int

def get_sales_analysis(
    product_id: int,
    start_date: str,
    end_date: str,
    conn,
    comparison_type: AnalysisType = AnalysisType.SALES_SUMMARY,
    second_product_id: Optional[int] = None,
    second_start_date: Optional[str] = None,
    second_end_date: Optional[str] = None
) -> Dict[str, Any]:
    cursor = conn.cursor()
    
    # Verifica se o produto existe
    cursor.execute("SELECT nome_produto FROM produto WHERE id_produto = %s", (product_id,))
    product = cursor.fetchone()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    result = {
        "productId": product_id,
        "productName": product["nome_produto"]
    }

    if comparison_type == AnalysisType.COMPARE_PERIODS:
        # Lógica para comparar dois períodos
        cursor.execute(
            """
            SELECT COUNT(*) AS total_ocorrencias
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            """,
            (product_id, start_date, end_date)
        )
        first_period = cursor.fetchone()["total_ocorrencias"] or 0

        cursor.execute(
            """
            SELECT COUNT(*) AS total_ocorrencias
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            """,
            (product_id, second_start_date, second_end_date)
        )
        second_period = cursor.fetchone()["total_ocorrencias"] or 0

        diff = second_period - first_period
        percentage = 0 if first_period == 0 else round((diff / first_period) * 100)

        result.update({
            "startDateSales": first_period,
            "endDateSales": second_period,
            "salesDifference": {
                "percentage": abs(percentage),
                "absoluteValue": abs(diff),
                "isIncrease": diff >= 0,
            },
            "showComparison": True
        })

    elif comparison_type == AnalysisType.COMPARE_PRODUCTS:
        # Lógica para comparar dois produtos
        cursor.execute(
            """
            SELECT COUNT(*) AS total_ocorrencias
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            """,
            (product_id, start_date, end_date)
        )
        current_product_sales = cursor.fetchone()["total_ocorrencias"] or 0

        cursor.execute(
            """
            SELECT COUNT(*) AS total_ocorrencias
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            """,
            (second_product_id, start_date, end_date)
        )
        second_product_sales = cursor.fetchone()["total_ocorrencias"] or 0

        diff = current_product_sales - second_product_sales
        percentage = 0 if second_product_sales == 0 else round((diff / second_product_sales) * 100)

        result.update({
            "startDateSales": second_product_sales,
            "endDateSales": current_product_sales,
            "salesDifference": {
                "percentage": abs(percentage),
                "absoluteValue": abs(diff),
                "isIncrease": diff >= 0,
            },
            "showComparison": True
        })

    else:  # AnalysisType.SALES_SUMMARY
        cursor.execute(
            """
            SELECT COUNT(*) AS total_ocorrencias
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            """,
            (product_id, start_date, end_date)
        )
        total_sales = cursor.fetchone()["total_ocorrencias"] or 0

        result.update({
            "startDateSales": 0,
            "endDateSales": total_sales,
            "salesDifference": {
                "percentage": 0,
                "absoluteValue": total_sales,
                "isIncrease": True,
            },
            "showComparison": False
        })

    # Adiciona produtos relacionados (função existente)
    cursor.execute(
        "SELECT id_compra FROM compra WHERE data_compra BETWEEN %s AND %s",
        (start_date, end_date)
    )
    purchase_ids = [p["id_compra"] for p in cursor.fetchall()]
    result["relatedProducts"] = get_related_products(conn, cursor, product_id, purchase_ids)

    return result

def consultar_vendas(id_produto: int, data_inicio: str, data_fim: str):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Converta as datas para o formato ISO (YYYY-MM-DD)
        data_inicio_iso = datetime.strptime(data_inicio, "%d-%m-%Y").strftime("%Y-%m-%d")
        data_fim_iso = datetime.strptime(data_fim, "%d-%m-%Y").strftime("%Y-%m-%d")
        
        cursor.execute(""" 
            SELECT COUNT(*) AS total_vendido
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
        """, (id_produto, data_inicio_iso, data_fim_iso))
        
        resultado = cursor.fetchone()
        return {"total_vendido": resultado["total_vendido"] if resultado else 0}
        
    except Exception as e:
        print(f"ERRO NA CONSULTA: {str(e)}")
        return {"error": str(e)}
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def selecionar_produto():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT id_produto, nome_produto, preco
            FROM produto
        """)
        resultado = cursor.fetchall()
        return resultado
    finally:
        cursor.close()
        conn.close()

def buscar_produto(query: str, search_type: str = "product"):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if search_type == "product":
            cursor.execute(
                "SELECT id_produto, nome_produto, preco FROM produto WHERE nome_produto ILIKE %s",
                (f"%{query}%",)
            )
        else:
            try:
                product_id = int(query)
                cursor.execute(
                    "SELECT id_produto, nome_produto, preco FROM produto WHERE id_produto = %s",
                    (product_id,)
                )
            except ValueError:
                raise ValueError("ID do produto deve ser um número válido")

        produto = cursor.fetchone()
        if not produto:
            return {"mensagem": "Produto não encontrado"}
        return produto
    finally:
        cursor.close()
        conn.close()

def consultar_compras_por_periodo(start_date: str, end_date: str):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT id_compra, data_compra, cpf 
            FROM compra 
            WHERE data_compra >= %s AND data_compra <= %s
            """,
            (start_date, end_date)
        )
        compras = cursor.fetchall()
        return compras
    finally:
        cursor.close()
        conn.close()

def consultar_itens_por_ids_de_compras(purchase_ids: List[int]):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute(
            """
            SELECT id, id_compra, id_produto, valor_unitario, encarte 
            FROM itens_compra 
            WHERE id_compra = ANY(%s)
            """,
            (purchase_ids,)
        )
        itens = cursor.fetchall()
        return itens
    finally:
        cursor.close()
        conn.close()

def analisar_vendas(
    product_id: int,
    start_date: str,
    end_date: str,
    comparison_type: str = "compare",
    is_second_product: bool = False,
    first_product_id: Optional[int] = None,
    compare_periods: bool = False,
    second_start_date: Optional[str] = None,
    second_end_date: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("SELECT id_produto, nome_produto FROM produto WHERE id_produto = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        if compare_periods and second_start_date and second_end_date:
            # Lógica para comparar dois períodos
            cursor.execute(
                """
                SELECT COUNT(*) AS total_ocorrencias
                FROM itens_compra i
                JOIN compra c ON i.id_compra = c.id_compra
                WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
                """,
                (product_id, start_date, end_date)
            )
            first_period_result = cursor.fetchone()
            first_period_sales = first_period_result["total_ocorrencias"] if first_period_result else 0

            cursor.execute(
                """
                SELECT COUNT(*) AS total_ocorrencias
                FROM itens_compra i
                JOIN compra c ON i.id_compra = c.id_compra
                WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
                """,
                (product_id, second_start_date, second_end_date)
            )
            second_period_result = cursor.fetchone()
            second_period_sales = second_period_result["total_ocorrencias"] if second_period_result else 0
            
            absolute_difference = second_period_sales - first_period_sales
            percentage_difference = 0 if first_period_sales == 0 else round((absolute_difference / first_period_sales) * 100)

            cursor.execute(
                "SELECT id_compra FROM compra WHERE data_compra BETWEEN %s AND %s OR data_compra BETWEEN %s AND %s",
                (start_date, end_date, second_start_date, second_end_date)
            )
            all_period_purchases = cursor.fetchall()
            combined_purchase_ids = [p["id_compra"] for p in all_period_purchases]
            
            related_products = get_related_products(conn, cursor, product_id, combined_purchase_ids)
            
            return {
                "productId": product_id,
                "productName": product["nome_produto"],
                "startDateSales": first_period_sales,
                "endDateSales": second_period_sales,
                "salesDifference": {
                    "percentage": abs(percentage_difference),
                    "absoluteValue": abs(absolute_difference),
                    "isIncrease": absolute_difference >= 0,
                },
                "relatedProducts": related_products,
                "showComparison": True
            }
        else:
            if comparison_type.lower() == "compare":
                # Modo COMPARAR: Compara vendas em duas datas específicas
                cursor.execute(
                    """
                    SELECT COUNT(*) AS total_ocorrencias
                    FROM itens_compra i
                    JOIN compra c ON i.id_compra = c.id_compra
                    WHERE i.id_produto = %s AND c.data_compra = %s
                    """,
                    (product_id, start_date)
                )
                start_date_result = cursor.fetchone()
                start_date_sales = start_date_result["total_ocorrencias"] if start_date_result else 0
                
                cursor.execute(
                    """
                    SELECT COUNT(*) AS total_ocorrencias
                    FROM itens_compra i
                    JOIN compra c ON i.id_compra = c.id_compra
                    WHERE i.id_produto = %s AND c.data_compra = %s
                    """,
                    (product_id, end_date)
                )
                end_date_result = cursor.fetchone()
                end_date_sales = end_date_result["total_ocorrencias"] if end_date_result else 0
                
                absolute_difference = end_date_sales - start_date_sales
                percentage_difference = 0 if start_date_sales == 0 else round((absolute_difference / start_date_sales) * 100)
                
                cursor.execute(
                    "SELECT id_compra FROM compra WHERE data_compra = %s OR data_compra = %s",
                    (start_date, end_date)
                )
                period_purchases = cursor.fetchall()
                period_purchase_ids = [p["id_compra"] for p in period_purchases]
                
                related_products = get_related_products(conn, cursor, product_id, period_purchase_ids)
                
                return {
                    "productId": product_id,
                    "productName": product["nome_produto"],
                    "startDateSales": start_date_sales,
                    "endDateSales": end_date_sales,
                    "salesDifference": {
                        "percentage": abs(percentage_difference),
                        "absoluteValue": abs(absolute_difference),
                        "isIncrease": absolute_difference >= 0,
                    },
                    "relatedProducts": related_products,
                    "showComparison": True
                }
            else:
                # Modo ATÉ: Soma todas as vendas no intervalo
                cursor.execute(
                    "SELECT id_compra FROM compra WHERE data_compra >= %s AND data_compra <= %s",
                    (start_date, end_date)
                )
                period_purchases = cursor.fetchall()
                period_purchase_ids = [p["id_compra"] for p in period_purchases]
                
                if period_purchase_ids:
                    cursor.execute(
                        "SELECT id FROM itens_compra WHERE id_compra = ANY(%s) AND id_produto = %s",
                        (period_purchase_ids, product_id)
                    )
                    period_items = cursor.fetchall()
                else:
                    period_items = []
                
                total_sales = len(period_items)
                
                related_products = get_related_products(conn, cursor, product_id, period_purchase_ids)
                
                if is_second_product and first_product_id:
                    if period_purchase_ids:
                        cursor.execute(
                            "SELECT id FROM itens_compra WHERE id_compra = ANY(%s) AND id_produto = %s",
                            (period_purchase_ids, first_product_id)
                        )
                        first_product_items = cursor.fetchall()
                    else:
                        first_product_items = []
                    
                    first_product_sales = len(first_product_items)
                    
                    absolute_difference = total_sales - first_product_sales
                    percentage_difference = 100 if first_product_sales == 0 else round((absolute_difference / first_product_sales) * 100)
                    
                    return {
                        "productId": product_id,
                        "productName": product["nome_produto"],
                        "startDateSales": first_product_sales,
                        "endDateSales": total_sales,
                        "salesDifference": {
                            "percentage": abs(percentage_difference),
                            "absoluteValue": abs(absolute_difference),
                            "isIncrease": absolute_difference >= 0,
                        },
                        "relatedProducts": related_products,
                        "showComparison": True
                    }
                
                return {
                    "productId": product_id,
                    "productName": product["nome_produto"],
                    "startDateSales": 0,
                    "endDateSales": total_sales,
                    "salesDifference": {
                        "percentage": 0,
                        "absoluteValue": total_sales,
                        "isIncrease": True,
                    },
                    "relatedProducts": related_products,
                    "showComparison": False
                }
    finally:
        cursor.close()
        conn.close()

def produtos_relacionados(product_id: int, start_date: str, end_date: str):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT id_compra 
            FROM compra 
            WHERE data_compra BETWEEN %s AND %s
            """,
            (start_date, end_date)
        )
        purchase_rows = cursor.fetchall()
        purchase_ids = [row["id_compra"] for row in purchase_rows]

        if not purchase_ids:
            return []

        # Usa exatamente a mesma lógica da sua função original
        result = get_related_products(conn, cursor, product_id, purchase_ids)

        return result

    finally:
        cursor.close()
        conn.close()

def historico_estoque(query: str, search_type: str, start_date: str, end_date: str):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT id_produto, nome_produto, preco 
            FROM produto 
            WHERE {} ILIKE %s
            """.format("nome_produto" if search_type == "product" else "id_produto"),
            (f"%{query}%",) if search_type == "product" else (query,)
        )
        product = cursor.fetchone()
        if not product:
            return {"error": "Produto não encontrado"}

        product_id = product["id_produto"]
        product_name = product["nome_produto"]
        unit_price = product["preco"]

        # Estoque inicial antes do período
        cursor.execute("""
            SELECT COALESCE(SUM(quantidade), 0) AS total_entradas
            FROM estoque 
            WHERE id_produto = %s AND tipo_movimentacao = 'entrada' AND data_movimentacao < %s
        """, (product_id, start_date))
        total_entradas = cursor.fetchone()["total_entradas"]

        cursor.execute("""
            SELECT COALESCE(COUNT(i.id_produto), 0) AS total_vendas
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra < %s
        """, (product_id, start_date))
        total_vendas = cursor.fetchone()["total_vendas"]

        initial_stock = max(0, total_entradas - total_vendas)

        # Datas no intervalo
        cursor.execute("""
            SELECT generate_series(%s::date, %s::date, '1 day'::interval)::date as date
        """, (start_date, end_date))
        dates = [row["date"].strftime("%Y-%m-%d") for row in cursor.fetchall()]

        # Entradas no período
        cursor.execute("""
            SELECT data_movimentacao::date AS date, SUM(quantidade) AS quantity
            FROM estoque
            WHERE id_produto = %s AND tipo_movimentacao = 'entrada' AND data_movimentacao BETWEEN %s AND %s
            GROUP BY data_movimentacao::date
        """, (product_id, start_date, end_date))
        entradas = {row["date"].strftime("%Y-%m-%d"): row["quantity"] for row in cursor.fetchall()}

        # Saídas (vendas) no período
        cursor.execute("""
            SELECT c.data_compra::date AS date, COUNT(i.id_produto) AS quantity
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            GROUP BY c.data_compra::date
        """, (product_id, start_date, end_date))
        saidas = {row["date"].strftime("%Y-%m-%d"): row["quantity"] for row in cursor.fetchall()}

        # Processar histórico
        current_stock = initial_stock
        history = []

        for date in dates:
            entries = entradas.get(date, 0)
            outputs = saidas.get(date, 0)

            current_stock = current_stock + entries - outputs
            stock_value = current_stock * unit_price

            history.append({
                "date": date,
                "quantity": current_stock,
                "entries": entries,
                "outputs": outputs,
                "value": stock_value
            })

        return {
            "productId": product_id,
            "productName": product_name,
            "sku": str(product_id),
            "startDate": start_date,
            "endDate": end_date,
            "initialStock": initial_stock,
            "history": history
        }

    finally:
        cursor.close()
        conn.close()

def total_estoque():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute("""
            WITH estoque_atual AS (
                SELECT 
                    e.id_estoque, 
                    e.id_produto, 
                    e.lote, 
                    e.data_validade,
                    e.quantidade - COALESCE((
                        SELECT COUNT(*) 
                        FROM itens_compra ic 
                        WHERE ic.lote = e.lote
                    ), 0) AS quantidade_atual,
                    (e.quantidade - COALESCE((
                        SELECT COUNT(*) 
                        FROM itens_compra ic 
                        WHERE ic.lote = e.lote
                    ), 0)) * p.preco AS valor_atual
                FROM estoque e
                JOIN produto p ON e.id_produto = p.id_produto
                WHERE e.quantidade > 0
            )
            SELECT
                SUM(quantidade_atual) AS quantidade_total,
                SUM(valor_atual) AS valor_total
            FROM estoque_atual
        """)
        
        result = cursor.fetchone()

        response = {
            "quantity": int(result["quantidade_total"] or 0),
            "value": float(result["valor_total"] or 0)
        }

        return response

    finally:
        cursor.close()
        conn.close()

def itens_estoque(id_produto=None):
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        consulta = """

            
                WITH estoque_atual AS (
                    SELECT 
                        e.id_estoque, 
                        e.id_produto, 
                        e.lote, 
                        e.data_validade,
                        e.quantidade - COALESCE((
                            SELECT COUNT(*) 
                            FROM itens_compra ic 
                            WHERE ic.lote = e.lote
                        ), 0) AS quantidade_atual,
                        (e.quantidade - COALESCE((
                            SELECT COUNT(*) 
                            FROM itens_compra ic 
                            WHERE ic.lote = e.lote
                        ), 0)) * p.preco AS valor_atual
                    FROM estoque e
                    JOIN produto p ON e.id_produto = p.id_produto
                    WHERE e.quantidade > 0
                )
                SELECT 
                    ea.id_produto,
                    p.nome_produto,
                    SUM(ea.quantidade_atual) AS quantidade,
                    SUM(ea.valor_atual) AS valor,
                    p.preco AS preco_unitario
                FROM estoque_atual ea
                JOIN produto p ON ea.id_produto = p.id_produto
                
            """
        params = []
        if id_produto is not None:
            consulta += " WHERE ea.id_produto = %s"
            params.append(id_produto)

        consulta += " GROUP BY ea.id_produto, p.nome_produto, p.preco ORDER BY p.nome_produto"

        cursor.execute(consulta, params)
        
        results = cursor.fetchall()

        stock_items = []
        for item in results:
            stock_items.append({
                "productId": item["id_produto"],
                "productName": item["nome_produto"],
                "quantity": int(item["quantidade"] or 0),
                "value": float(item["valor"] or 0),
                "unitPrice": float(item["preco_unitario"] or 0)
            })

        return stock_items

    finally:
        cursor.close()
        conn.close()

def vendas_total(data_inicio=None, data_fim=None):
    conn = None
    cursor = None
    
    
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        if not data_inicio or not data_fim:
            data_fim = datetime.today().date().isoformat()
            data_inicio = (datetime.today().date().replace(year=datetime.today().year - 1)).isoformat()
        else:
            # Apenas valida que a data está no formato ISO (YYYY-MM-DD)
            try:
                datetime.strptime(data_inicio, "%Y-%m-%d")
                datetime.strptime(data_fim, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Datas devem estar no formato YYYY-MM-DD (ex: 2024-06-25)")
        cursor.execute("""
            WITH vendas_produto AS (
                SELECT id_produto, COUNT(*) AS total_vendido
                FROM itens_compra ic
                JOIN compra c ON ic.id_compra = c.id_compra
                WHERE c.data_compra BETWEEN %s AND %s
                GROUP BY id_produto
            )
            SELECT p.id_produto, p.nome_produto, vp.total_vendido, p.preco
            FROM produto p
            LEFT JOIN vendas_produto vp ON p.id_produto = vp.id_produto
            ORDER BY vp.total_vendido DESC NULLS LAST
            LIMIT 10;
        """, (data_inicio, data_fim))

        vendas = cursor.fetchall()
        
        cursor.execute("""
            WITH estoque_atual AS (
                SELECT e.id_produto, e.lote,
                       e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0) AS quantidade_atual
                FROM estoque e
                WHERE e.quantidade > 0
            )
            SELECT
                p.id_produto,
                p.nome_produto,
                SUM(ea.quantidade_atual) AS estoque_atual,
                SUM(ea.quantidade_atual * p.preco) AS valor_estoque
            FROM produto p
            LEFT JOIN estoque_atual ea ON p.id_produto = ea.id_produto
            GROUP BY p.id_produto, p.nome_produto;
        """)
        estoque = cursor.fetchall()
        
        resumo_vendas = "Top 10 produtos mais vendidos no último ano:\n"
        
        top_vendas_formatado = []
        for v in vendas:
            total = v['total_vendido'] if v['total_vendido'] is not None else 0
            resumo_vendas += (
                f"- {v['nome_produto']}: {total} unidades vendidas "
                f"(preço unitário R$ {v['preco']:.2f})\n"
            )


        resumo_estoque = "Estoque atual resumido:\n"
        for e in estoque:
            qtd = e['estoque_atual'] if e['estoque_atual'] is not None else 0
            val = e['valor_estoque'] if e['valor_estoque'] is not None else 0
            resumo_estoque += (
                f"- {e['nome_produto']}: {qtd} unidades "
                f"(valor total R$ {val:.2f})\n"
            )
            
        response = {
            "top_vendas": vendas,
            "estoque_atual": estoque,
            "resumo": resumo_vendas + resumo_estoque
        }

        return response

    finally:
        cursor.close()
        conn.close()    

@router.get("/api/embed-url")
def get_embed_url():
    client = boto3.client("quicksight", region_name=AWS_REGION)

    try:
        response = client.get_dashboard_embed_url(
            AwsAccountId=AWS_ACCOUNT_ID,
            DashboardId=DASHBOARD_ID,
            IdentityType="QUICKSIGHT",
            UserArn=f"arn:aws:quicksight:{AWS_REGION}:{AWS_ACCOUNT_ID}:user/default/{QUICKSIGHT_USER}",
            SessionLifetimeInMinutes=600,
            UndoRedoDisabled=False,
            ResetDisabled=False,
        )
        return JSONResponse(content={"url": response["EmbedUrl"]})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/test-db-connection")
async def test_db():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        cur.close()
        conn.close()
        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Sales Synergy Analyzer"}

@app.get("/products", response_model=List[Product])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id_produto, nome_produto, preco FROM produto")
        products = cursor.fetchall()
        return products
    finally:
        cursor.close()
        conn.close()

@app.get("/products/search/{query}", response_model=Product)
def search_product(query: str, search_type: str = "product"):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if search_type == "product":
            cursor.execute("SELECT id_produto, nome_produto, preco FROM produto WHERE nome_produto ILIKE %s", (f"%{query}%",))
        else:
            try:
                product_id = int(query)
                cursor.execute("SELECT id_produto, nome_produto, preco FROM produto WHERE id_produto = %s", (product_id,))
            except ValueError:
                raise HTTPException(status_code=400, detail="ID do produto deve ser um número")
        
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        return product
    finally:
        cursor.close()
        conn.close()

@app.get("/purchases/date-range", response_model=List[Purchase])
def get_purchases_by_date_range(start_date: str, end_date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id_compra, data_compra, cpf FROM compra WHERE data_compra >= %s AND data_compra <= %s",
            (start_date, end_date)
        )
        purchases = cursor.fetchall()
        return purchases
    finally:
        cursor.close()
        conn.close()

@app.get("/purchase-items/by-purchase-ids", response_model=List[PurchaseItem])
def get_purchase_items_by_purchase_ids(purchase_ids: str):
    ids = [int(id) for id in purchase_ids.split(",")]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, id_compra, id_produto, valor_unitario, encarte FROM itens_compra WHERE id_compra = ANY(%s)",
            (ids,)
        )
        items = cursor.fetchall()
        return items
    finally:
        cursor.close()
        conn.close()

@app.get("/analysis/sales", response_model=SalesAnalysis)
def analyze_sales(
    product_id: int,
    start_date: str,
    end_date: str,
    comparison_type: str = "compare",
    is_second_product: bool = False,
    first_product_id: Optional[int] = None,
    compare_periods: bool = False,
    second_start_date: Optional[str] = None,
    second_end_date: Optional[str] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id_produto, nome_produto FROM produto WHERE id_produto = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        if compare_periods and second_start_date and second_end_date:
            # Lógica para comparar dois períodos
            cursor.execute(
                """
                SELECT COUNT(*) AS total_ocorrencias
                FROM itens_compra i
                JOIN compra c ON i.id_compra = c.id_compra
                WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
                """,
                (product_id, start_date, end_date)
            )
            first_period_result = cursor.fetchone()
            first_period_sales = first_period_result["total_ocorrencias"] if first_period_result else 0

            cursor.execute(
                """
                SELECT COUNT(*) AS total_ocorrencias
                FROM itens_compra i
                JOIN compra c ON i.id_compra = c.id_compra
                WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
                """,
                (product_id, second_start_date, second_end_date)
            )
            second_period_result = cursor.fetchone()
            second_period_sales = second_period_result["total_ocorrencias"] if second_period_result else 0
            
            absolute_difference = second_period_sales - first_period_sales
            percentage_difference = 0 if first_period_sales == 0 else round((absolute_difference / first_period_sales) * 100)

            cursor.execute(
                "SELECT id_compra FROM compra WHERE data_compra BETWEEN %s AND %s OR data_compra BETWEEN %s AND %s",
                (start_date, end_date, second_start_date, second_end_date)
            )
            all_period_purchases = cursor.fetchall()
            combined_purchase_ids = [p["id_compra"] for p in all_period_purchases]
            
            related_products = get_related_products(conn, cursor, product_id, combined_purchase_ids)
            
            return {
                "productId": product_id,
                "productName": product["nome_produto"],
                "startDateSales": first_period_sales,
                "endDateSales": second_period_sales,
                "salesDifference": {
                    "percentage": abs(percentage_difference),
                    "absoluteValue": abs(absolute_difference),
                    "isIncrease": absolute_difference >= 0,
                },
                "relatedProducts": related_products,
                "showComparison": True
            }
        else:
            if comparison_type.lower() == "compare":
                # Modo COMPARAR: Compara vendas em duas datas específicas
                cursor.execute(
                    """
                    SELECT COUNT(*) AS total_ocorrencias
                    FROM itens_compra i
                    JOIN compra c ON i.id_compra = c.id_compra
                    WHERE i.id_produto = %s AND c.data_compra = %s
                    """,
                    (product_id, start_date)
                )
                start_date_result = cursor.fetchone()
                start_date_sales = start_date_result["total_ocorrencias"] if start_date_result else 0
                
                cursor.execute(
                    """
                    SELECT COUNT(*) AS total_ocorrencias
                    FROM itens_compra i
                    JOIN compra c ON i.id_compra = c.id_compra
                    WHERE i.id_produto = %s AND c.data_compra = %s
                    """,
                    (product_id, end_date)
                )
                end_date_result = cursor.fetchone()
                end_date_sales = end_date_result["total_ocorrencias"] if end_date_result else 0
                
                absolute_difference = end_date_sales - start_date_sales
                percentage_difference = 0 if start_date_sales == 0 else round((absolute_difference / start_date_sales) * 100)
                
                cursor.execute(
                    "SELECT id_compra FROM compra WHERE data_compra = %s OR data_compra = %s",
                    (start_date, end_date)
                )
                period_purchases = cursor.fetchall()
                period_purchase_ids = [p["id_compra"] for p in period_purchases]
                
                related_products = get_related_products(conn, cursor, product_id, period_purchase_ids)
                
                return {
                    "productId": product_id,
                    "productName": product["nome_produto"],
                    "startDateSales": start_date_sales,
                    "endDateSales": end_date_sales,
                    "salesDifference": {
                        "percentage": abs(percentage_difference),
                        "absoluteValue": abs(absolute_difference),
                        "isIncrease": absolute_difference >= 0,
                    },
                    "relatedProducts": related_products,
                    "showComparison": True
                }
            else:
                # Modo ATÉ: Soma todas as vendas no intervalo
                cursor.execute(
                    "SELECT id_compra FROM compra WHERE data_compra >= %s AND data_compra <= %s",
                    (start_date, end_date)
                )
                period_purchases = cursor.fetchall()
                period_purchase_ids = [p["id_compra"] for p in period_purchases]
                
                if period_purchase_ids:
                    cursor.execute(
                        "SELECT id FROM itens_compra WHERE id_compra = ANY(%s) AND id_produto = %s",
                        (period_purchase_ids, product_id)
                    )
                    period_items = cursor.fetchall()
                else:
                    period_items = []
                
                total_sales = len(period_items)
                
                related_products = get_related_products(conn, cursor, product_id, period_purchase_ids)
                
                if is_second_product and first_product_id:
                    if period_purchase_ids:
                        cursor.execute(
                            "SELECT id FROM itens_compra WHERE id_compra = ANY(%s) AND id_produto = %s",
                            (period_purchase_ids, first_product_id)
                        )
                        first_product_items = cursor.fetchall()
                    else:
                        first_product_items = []
                    
                    first_product_sales = len(first_product_items)
                    
                    absolute_difference = total_sales - first_product_sales
                    percentage_difference = 100 if first_product_sales == 0 else round((absolute_difference / first_product_sales) * 100)
                    
                    return {
                        "productId": product_id,
                        "productName": product["nome_produto"],
                        "startDateSales": first_product_sales,
                        "endDateSales": total_sales,
                        "salesDifference": {
                            "percentage": abs(percentage_difference),
                            "absoluteValue": abs(absolute_difference),
                            "isIncrease": absolute_difference >= 0,
                        },
                        "relatedProducts": related_products,
                        "showComparison": True
                    }
                
                return {
                    "productId": product_id,
                    "productName": product["nome_produto"],
                    "startDateSales": 0,
                    "endDateSales": total_sales,
                    "salesDifference": {
                        "percentage": 0,
                        "absoluteValue": total_sales,
                        "isIncrease": True,
                    },
                    "relatedProducts": related_products,
                    "showComparison": False
                }
    finally:
        cursor.close()
        conn.close()

def get_related_products(conn, cursor, product_id, purchase_ids):
    if not purchase_ids:
        return []
    
    cursor.execute(
        "SELECT id, id_compra, id_produto FROM itens_compra WHERE id_compra = ANY(%s)",
        (purchase_ids,)
    )
    all_purchase_items = cursor.fetchall()
    
    purchases_with_product = []
    for item in all_purchase_items:
        if item["id_produto"] == product_id and item["id_compra"] not in purchases_with_product:
            purchases_with_product.append(item["id_compra"])
    
    if not purchases_with_product:
        return []
    
    product_occurrences = {}
    
    for purchase_id in purchases_with_product:
        purchase_items = [item for item in all_purchase_items 
                         if item["id_compra"] == purchase_id and item["id_produto"] != product_id]
        
        unique_products = set(item["id_produto"] for item in purchase_items)
        for product_id_key in unique_products:
            if product_id_key not in product_occurrences:
                product_occurrences[product_id_key] = 0
            product_occurrences[product_id_key] += 1
    
    total_purchases = len(purchases_with_product)
    
    related_products_data = []
    
    for id_produto, occurrences in product_occurrences.items():
        cursor.execute("SELECT nome_produto FROM produto WHERE id_produto = %s", (id_produto,))
        product = cursor.fetchone()
        
        related_products_data.append({
            "productName": product["nome_produto"] if product else f"Produto {id_produto}",
            "occurrences": occurrences,
            "percentage": round((occurrences / total_purchases) * 100),
            "absoluteValue": occurrences,
        })
    
    return sorted(related_products_data, key=lambda x: x["percentage"], reverse=True)[:5]

@app.get("/stock/history")
def get_stock_history(query: str, search_type: str, start_date: str, end_date: str):
    print(f"Recebido - Query: {query}, Tipo: {search_type}, Início: {start_date}, Fim: {end_date}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Obter o ID do produto
        product_id = None
        if search_type == "product":
            cursor.execute("SELECT id_produto, nome_produto FROM produto WHERE nome_produto ILIKE %s", (f"%{query}%",))
            product = cursor.fetchone()
            if product:
                product_id = product["id_produto"]
                product_name = product["nome_produto"]
        elif search_type == "sku":
            try:
                product_id = int(query)
                cursor.execute("SELECT nome_produto FROM produto WHERE id_produto = %s", (product_id,))
                product = cursor.fetchone()
                if product:
                    product_name = product["nome_produto"]
                else:
                    raise HTTPException(status_code=404, detail="Produto não encontrado")
            except ValueError:
                raise HTTPException(status_code=400, detail="ID do produto deve ser um número")
        
        if not product_id:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # 2. Calcular estoque inicial (antes do período solicitado)
        cursor.execute("""
            SELECT COALESCE(SUM(quantidade), 0) as total_entradas
            FROM estoque 
            WHERE id_produto = %s AND tipo_movimentacao = 'entrada' AND data_movimentacao < %s
        """, (product_id, start_date))
        result = cursor.fetchone()
        total_entradas = result["total_entradas"] if result else 0

        cursor.execute("""
            SELECT COALESCE(COUNT(i.id_produto), 0) as total_vendas
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra < %s
        """, (product_id, start_date))
        result = cursor.fetchone()
        total_vendas = result["total_vendas"] if result else 0

        initial_stock = max(0, total_entradas - total_vendas)

        # 3. Gerar lista de todas as datas no intervalo
        cursor.execute("""
            SELECT generate_series(%s::date, %s::date, '1 day'::interval)::date as date
        """, (start_date, end_date))
        all_dates = [row["date"].strftime("%Y-%m-%d") for row in cursor.fetchall()]

        # 4. Obter todas as entradas no período
        cursor.execute("""
            SELECT 
                data_movimentacao::date as date,
                SUM(quantidade) as quantity
            FROM estoque
            WHERE id_produto = %s AND tipo_movimentacao = 'entrada' 
                  AND data_movimentacao::date BETWEEN %s AND %s
            GROUP BY data_movimentacao::date
            ORDER BY data_movimentacao::date
        """, (product_id, start_date, end_date))
        entradas = {row["date"].strftime("%Y-%m-%d"): row["quantity"] for row in cursor.fetchall()}

        # 5. Obter todas as saídas (vendas) no período
        cursor.execute("""
            SELECT 
                c.data_compra::date as date,
                COUNT(i.id_produto) as quantity
            FROM itens_compra i
            JOIN compra c ON i.id_compra = c.id_compra
            WHERE i.id_produto = %s AND c.data_compra BETWEEN %s AND %s
            GROUP BY c.data_compra::date
            ORDER BY c.data_compra::date
        """, (product_id, start_date, end_date))
        saidas = {row["date"].strftime("%Y-%m-%d"): row["quantity"] for row in cursor.fetchall()}

        # 6. Obter preço unitário do produto para cálculo de valor
        cursor.execute("""
            SELECT preco FROM produto WHERE id_produto = %s
        """, (product_id,))
        result = cursor.fetchone()
        unit_price = result["preco"] if result else 0
        
        # 7. Processar o histórico dia a dia
        history = []
        current_stock = initial_stock
        
        for date in all_dates:
            entries = entradas.get(date, 0)
            outputs = saidas.get(date, 0)
            
            # Atualizar estoque atual
            current_stock = current_stock + entries - outputs
            
            # Calcular valor do estoque (quantidade x preço unitário)
            stock_value = current_stock * unit_price
            
            # Adicionar ao histórico
            history.append({
                "date": date,
                "quantity": current_stock,
                "entries": entries,
                "outputs": outputs,
                "value": stock_value
            })
        
        # 7. Montar resposta
        response = {
            "productId": product_id,
            "productName": product_name,
            "sku": str(product_id),  # Usando o id_produto como SKU
            "startDate": start_date,
            "endDate": end_date,
            "initialStock": initial_stock,
            "history": history
        }

        return response
        
    except Exception as e:
        print(f"Erro ao processar histórico de estoque: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar histórico de estoque: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/stock/classification")
def get_stock_classification(query: str, search_type: str):
    print(f"Recebido - Query: {query}, Tipo: {search_type}")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 1. Obter o ID do produto
        product_id = None
        if search_type == "product":
            cursor.execute("SELECT id_produto, nome_produto FROM produto WHERE nome_produto ILIKE %s", (f"%{query}%",))
            product = cursor.fetchone()
            if product:
                product_id = product["id_produto"]
        elif search_type == "sku":
            try:
                product_id = int(query)
                cursor.execute("SELECT nome_produto FROM produto WHERE id_produto = %s", (product_id,))
                product = cursor.fetchone()
                if not product:
                    raise HTTPException(status_code=404, detail="Produto não encontrado")
            except ValueError:
                raise HTTPException(status_code=400, detail="ID do produto deve ser um número")
        
        if not product_id:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # 2. Executar a consulta SQL para classificação de estoque
        cursor.execute("""
            WITH dias_vendas AS (
                -- Conta quantos dias tiveram vendas para calcular a média correta
                SELECT id_produto, COUNT(DISTINCT c.data_compra) AS dias_com_venda
                FROM itens_compra ic
                JOIN compra c ON ic.id_compra = c.id_compra
                WHERE c.data_compra BETWEEN CURRENT_DATE - INTERVAL '365 days' AND CURRENT_DATE
                GROUP BY id_produto
            ),
            vendas_produto AS (
                -- Soma o total vendido de cada produto no período analisado
                SELECT id_produto, SUM(1) AS total_vendido
                FROM itens_compra ic
                JOIN compra c ON ic.id_compra = c.id_compra
                WHERE c.data_compra BETWEEN CURRENT_DATE - INTERVAL '365 days' AND CURRENT_DATE
                GROUP BY id_produto
            ),
            estoque_atual AS (
                -- Calcula a quantidade disponível no estoque de cada lote
                SELECT e.id_estoque, e.id_produto, e.lote, e.data_validade,
                       e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0) AS quantidade_atual
                FROM estoque e
            ),
            classificacao_lotes AS (
                SELECT 
                    ea.id_produto,
                    CASE 
                        WHEN ea.quantidade_atual <= 0 THEN 'SEM ESTOQUE'  -- Lotes já vendidos
                        WHEN ea.data_validade < CURRENT_DATE THEN 'VENCIDO'
                        WHEN (ea.quantidade_atual / NULLIF(vp.total_vendido / dv.dias_com_venda, 0)) < 15 
                             OR ea.data_validade < CURRENT_DATE + INTERVAL '90 days' THEN 'IDADE CRÍTICA'
                        WHEN (ea.quantidade_atual / NULLIF(vp.total_vendido / dv.dias_com_venda, 0)) > 30 THEN 'STOCK OVER'
                        ELSE 'OK'
                    END AS classificacao,
                    ea.quantidade_atual
                FROM estoque_atual ea
                LEFT JOIN vendas_produto vp ON ea.id_produto = vp.id_produto
                LEFT JOIN dias_vendas dv ON ea.id_produto = dv.id_produto
                WHERE ea.quantidade_atual > 0 AND ea.id_produto = %s
            )
            SELECT 
                SUM(CASE WHEN classificacao = 'STOCK OVER' THEN quantidade_atual ELSE 0 END) AS stock_over,
                SUM(CASE WHEN classificacao = 'IDADE CRÍTICA' THEN quantidade_atual ELSE 0 END) AS critical_age,
                SUM(CASE WHEN classificacao = 'VENCIDO' THEN quantidade_atual ELSE 0 END) AS expired,
                SUM(CASE WHEN classificacao = 'OK' THEN quantidade_atual ELSE 0 END) AS ok,
                SUM(quantidade_atual) AS total
            FROM classificacao_lotes
        """, (product_id,))
        
        result = cursor.fetchone()
        
        if not result:
            return {
                "stockOver": 0,
                "criticalAge": 0,
                "expired": 0,
                "ok": 0,
                "total": 0
            }
        
        # 3. Montar resposta
        response = {
            "stockOver": int(result["stock_over"] or 0),
            "criticalAge": int(result["critical_age"] or 0),
            "expired": int(result["expired"] or 0),
            "ok": int(result["ok"] or 0),
            "total": int(result["total"] or 0)
        }

        return response
        
    except Exception as e:
        print(f"Erro ao processar classificação de estoque: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar classificação de estoque: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/stock/total")
def get_stock_total():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            WITH estoque_atual AS (
                -- Calcula a quantidade disponível no estoque de cada lote
                SELECT e.id_estoque, e.id_produto, e.lote, e.data_validade,
                       e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0) AS quantidade_atual,
                       (e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0)) * p.preco AS valor_atual
                FROM estoque e
                JOIN produto p ON e.id_produto = p.id_produto
                WHERE e.quantidade > 0
            )
            SELECT
                SUM(quantidade_atual) AS quantidade_total,
                SUM(valor_atual) AS valor_total
            FROM estoque_atual
        """)
        result = cursor.fetchone()

        if not result:
            return {"quantity": 0, "value": 0}

        response = {
            "quantity": int(result["quantidade_total"] or 0),
            "value": float(result["valor_total"] or 0)
        }

        return response
    except Exception as e:
        print(f"Erro ao obter total de estoque: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter total de estoque: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.get("/stock/items")
def get_stock_items():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            WITH estoque_atual AS (
                -- Calcula a quantidade disponível no estoque de cada lote
                SELECT e.id_estoque, e.id_produto, e.lote, e.data_validade,
                       e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0) AS quantidade_atual,
                       (e.quantidade - COALESCE((SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote), 0)) * p.preco AS valor_atual
                FROM estoque e
                JOIN produto p ON e.id_produto = p.id_produto
                WHERE e.quantidade > 0
            )
            SELECT 
                ea.id_produto,
                p.nome_produto,
                SUM(ea.quantidade_atual) AS quantidade,
                SUM(ea.valor_atual) AS valor,
                p.preco AS preco_unitario
            FROM estoque_atual ea
            JOIN produto p ON ea.id_produto = p.id_produto
            GROUP BY ea.id_produto, p.nome_produto, p.preco
            ORDER BY p.nome_produto
        """)
        results = cursor.fetchall()

        stock_items = []
        for item in results:
            stock_items.append({
                "productId": item["id_produto"],
                "productName": item["nome_produto"],
                "quantity": int(item["quantidade"] or 0),
                "value": float(item["valor"] or 0),
                "unitPrice": float(item["preco_unitario"] or 0)
            })

        return stock_items
    except Exception as e:
        print(f"Erro ao obter itens de estoque: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao obter itens de estoque: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# Adicionar no seu arquivo main.py existente

@app.get("/api/markup/general")
def get_general_markup():
    try:
        # Executar a consulta SQL para obter o mark-up geral
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            WITH estoque_atual AS (
                SELECT 
                    e.id_produto,
                    e.lote,
                    e.valor_unitario,
                    e.quantidade - COALESCE(
                        (SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote),
                        0
                    ) AS quantidade_disponivel
                FROM estoque e   
            ),
            filtrado AS (
                SELECT * FROM estoque_atual
                WHERE quantidade_disponivel > 0
            ),
            markup_por_lote AS (
                SELECT 
                    f.id_produto,
                    f.lote,
                    f.valor_unitario,
                    f.quantidade_disponivel,
                    p.preco,
                    ((p.preco - f.valor_unitario) / f.valor_unitario) * 100 AS markup_lote,
                    (((p.preco - f.valor_unitario) / f.valor_unitario) * 100) * f.quantidade_disponivel AS markup_ponderado
                FROM filtrado f
                JOIN produto p ON f.id_produto = p.id_produto
            ),
            markup_por_produto AS (
                SELECT 
                    id_produto,
                    ROUND(SUM(markup_ponderado) / SUM(quantidade_disponivel), 2) AS markup_medio_ponderado
                FROM markup_por_lote
                GROUP BY id_produto
            )
            SELECT 
                ROUND(AVG(markup_medio_ponderado), 2) AS markup_geral_ponderado
            FROM markup_por_produto;
        """)
        
        result = cursor.fetchone()
        markup_value = result[0] if result else 0
        
        # Aqui você poderia buscar dados históricos para calcular a variação
        # Por enquanto, vamos usar um valor fixo para a variação
        markup_change = 0.8
        
        conn.close()
        
        return ({
            'markupValue': markup_value,
            'markupChange': markup_change
        })
    except Exception as e:
        return ({'error': str(e)}), 500

@app.get("/api/markup/product/<int:product_id>")
def get_product_markup(product_id):
    try:
        # Executar a consulta SQL para obter o mark-up do produto
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            WITH estoque_atual AS (
                SELECT 
                    e.id_produto,
                    e.lote,
                    e.valor_unitario,
                    e.quantidade - COALESCE(
                        (SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote),
                        0
                    ) AS quantidade_disponivel
                FROM estoque e   
            ),
            filtrado AS (
                SELECT * FROM estoque_atual
                WHERE quantidade_disponivel > 0
            ),
            markup_por_lote AS (
                SELECT 
                    f.id_produto,
                    f.lote,
                    f.valor_unitario,
                    f.quantidade_disponivel,
                    p.preco,
                    ((p.preco - f.valor_unitario) / f.valor_unitario) * 100 AS markup_lote,
                    (((p.preco - f.valor_unitario) / f.valor_unitario) * 100) * f.quantidade_disponivel AS markup_ponderado
                FROM filtrado f
                JOIN produto p ON f.id_produto = p.id_produto
            )
            SELECT 
                id_produto,
                ROUND(SUM(markup_ponderado) / SUM(quantidade_disponivel), 2) AS markup_medio_ponderado
            FROM markup_por_lote
            WHERE id_produto = %s
            GROUP BY id_produto;
        """, (product_id,))
        
        result = cursor.fetchone()
        markup_value = result[1] if result else 0
        
        # Obter o mark-up geral para calcular a variação
        cursor.execute("""
            WITH estoque_atual AS (
                SELECT 
                    e.id_produto,
                    e.lote,
                    e.valor_unitario,
                    e.quantidade - COALESCE(
                        (SELECT COUNT(*) FROM itens_compra ic WHERE ic.lote = e.lote),
                        0
                    ) AS quantidade_disponivel
                FROM estoque e   
            ),
            filtrado AS (
                SELECT * FROM estoque_atual
                WHERE quantidade_disponivel > 0
            ),
            markup_por_lote AS (
                SELECT 
                    f.id_produto,
                    f.lote,
                    f.valor_unitario,
                    f.quantidade_disponivel,
                    p.preco,
                    ((p.preco - f.valor_unitario) / f.valor_unitario) * 100 AS markup_lote,
                    (((p.preco - f.valor_unitario) / f.valor_unitario) * 100) * f.quantidade_disponivel AS markup_ponderado
                FROM filtrado f
                JOIN produto p ON f.id_produto = p.id_produto
            ),
            markup_por_produto AS (
                SELECT 
                    id_produto,
                    ROUND(SUM(markup_ponderado) / SUM(quantidade_disponivel), 2) AS markup_medio_ponderado
                FROM markup_por_lote
                GROUP BY id_produto
            )
            SELECT 
                ROUND(AVG(markup_medio_ponderado), 2) AS markup_geral_ponderado
            FROM markup_por_produto;
        """)
        
        general_result = cursor.fetchone()
        general_markup = general_result[0] if general_result else 0
        
        markup_change = round(markup_value - general_markup, 2)
        
        conn.close()
        
        return ({
            'productId': product_id,
            'markupValue': markup_value,
            'markupChange': markup_change
        })
    except Exception as e:
        return ({'error': str(e)}), 500







@app.post("/analytics")
async def responder_pergunta(req: PerguntaRequest):
    conn = None
    cursor = None
    try:
        pergunta = req.pergunta
        messages = [
            {"role": "system", "content": "Você é um assistente de análise de dados. Sempre que possível, utilize as funções disponíveis para responder perguntas sobre vendas, estoque ou produtos."
            "Sempre que responder perguntas sobre produtos mais vendidos, inclua para cada produto: o nome, a quantidade total vendida no período e o preço unitário, em formato de lista ordenada. "
            "Para outros tipos de perguntas, responda de forma clara e objetiva, trazendo os dados relevantes conforme solicitado pelo usuário."},
            {"role": "user", "content": pergunta}
        ]
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "consultar_vendas",
                    "description": "Consulta vendas por produto e período. Datas no formato DD-MM-AAAA",
                    "parameters": {
                
                
                        "type": "object",
                        "properties": {
                            "id_produto": {"type": "integer", "description": "ID numérico do produto"},
                            "data_inicio": {"type": "string", "description": "Data inicial no formato DD-MM-AAAA"},
                            "data_fim": {"type": "string", "description": "Data final no formato DD-MM-AAAA"}
                                
                            
                        },
                        "required": ["id_produto", "data_inicio", "data_fim"]
                        
                    }
                }    
            },
        
            {
                "type": "function",
                "function": {
                    "name": "selecionar_produto",
                    "description": "Retorna a lista de produtos com id, nome e preço.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "buscar_produto",
                    "description": "Busca um produto específico por nome ou ID.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Termo de busca - pode ser nome do produto ou ID"
                            },
                            "search_type": {
                                "type": "string",
                                "enum": ["product", "id"],
                                "description": "Tipo de busca: 'product' para nome ou 'id' para código"
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "consultar_compras_por_periodo",
                    "description": "Consulta compras realizadas em um intervalo de datas.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data inicial no formato YYYY-MM-DD"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data final no formato YYYY-MM-DD"
                            }
                        },
                        "required": ["start_date", "end_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "consultar_itens_por_ids_de_compras",
                    "description": "Consulta itens de compra a partir de IDs de compras.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "purchase_ids": {
                                "type": "array",
                                "items": {
                                    "type": "integer"
                                },
                                "description": "Lista de IDs de compras"
                            }
                        },
                        "required": ["purchase_ids"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "analisar_vendas",
                    "description": "Analisa vendas de um produto com opções de comparação.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_id": {
                                "type": "integer",
                                "description": "ID do produto a ser analisado"
                            },
                            "start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data inicial (YYYY-MM-DD)"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data final (YYYY-MM-DD)"
                            },
                            "comparison_type": {
                                "type": "string",
                                "enum": ["compare", "range"],
                                "description": "Tipo de comparação: 'compare' para datas específicas ou 'range' para intervalo"
                            },
                            "is_second_product": {
                                "type": "boolean",
                                "description": "Se deve comparar com outro produto"
                            },
                            "first_product_id": {
                                "type": "integer",
                                "description": "ID do primeiro produto para comparação"
                            },
                            "compare_periods": {
                                "type": "boolean",
                                "description": "Se deve comparar períodos diferentes"
                            },
                            "second_start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data inicial do segundo período"
                            },
                            "second_end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data final do segundo período"
                            }
                        },
                        "required": ["product_id", "start_date", "end_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "produtos_relacionados",
                    "description": "Identifica produtos frequentemente comprados junto com o produto especificado.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_id": {
                                "type": "integer",
                                "description": "ID do produto de referência"
                            },
                            "start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data inicial do período de análise"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data final do período de análise"
                            }
                        },
                        "required": ["product_id", "start_date", "end_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "historico_estoque",
                    "description": "Retorna o histórico de movimentação de estoque de um produto.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Nome ou ID do produto"
                            },
                            "search_type": {
                                "type": "string",
                                "enum": ["product", "sku"],
                                "description": "Tipo de busca: 'product' para nome ou 'sku' para ID"
                            },
                            "start_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data inicial do período"
                            },
                            "end_date": {
                                "type": "string",
                                "format": "date",
                                "description": "Data final do período"
                            }
                        },
                        "required": ["query", "search_type", "start_date", "end_date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "classificacao_estoque",
                    "description": "Classifica o estoque de um produto em categorias: vencido, idade crítica, excesso (stock over) e ok, considerando validade e giro dos últimos 365 dias.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "product_id": {
                                "type": "integer",
                                "description": "ID do produto"
                            },
                            "query": {
                                "type": "string",
                                "description": "O nome ou SKU do produto. Exemplo: 'Leite' ou '5'."
                            },
                            "search_type": {
                                "type": "string",
                                "enum": ["product", "sku"],
                                "description": "Indica se a busca será pelo nome ('product') ou pelo SKU ('sku')."
                            }
                        },
                        "required": ["query", "search_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "total_estoque",
                    "description": "Retorna o total de estoque em quantidade e valor financeiro.",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "itens_estoque",
                    "description": "Consulta os itens em estoque, incluindo quantidade e valor. Pode consultar um produto específico, se fornecido.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "id_produto": {
                                "type": "integer",
                                "description": "ID do produto que deseja consultar. Se não for informado, retorna o estoque de todos os produtos."                              
                            }
                        },
                        "required": []
                    }
                }
            },
            {   
                "type": "function",
                "function": {
                    "name": "vendas_total",
                    "description": "Retorna os produtos mais vendidos em um determinado período especificado ou não pelo usuário.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "data_inicio": {
                                "type": "string",
                                "format": "date",
                                "description": "Data de início do período no formato DD-MM-AAAA."
                            },
                            "data_fim": {
                                "type": "string",
                                "format": "date",
                                "description": "Data de fim do período no formato DD-MM-AAAA."
                            }
                        },
                        "required": []
                    }
                }   
            }
   
        ]
        print(f"Pergunta recebida: {pergunta}")
        print(f"Tools configuradas: {json.dumps(tools, indent=2)}")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.0
        )
        response_message = response.choices[0].message
    
        

        
        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            function_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            tool_call_id = tool_call.id
            print(f"Função chamada: {function_name}")
            print(f"Argumentos recebidos: {arguments}")

            FUNCOES_COM_BD = [
                "consultar_vendas", "selecionar_produto", "buscar_produto",
                "consultar_compras_por_periodo", "consultar_itens_por_ids_de_compras",
                "analisar_vendas", "produtos_relacionados", "historico_estoque",
                "classificacao_estoque", "total_estoque", "itens_estoque",
                "vendas_total"
            ]
                    
            
                
            try:
                if function_name == "consultar_vendas":
                    resultado = consultar_vendas(arguments["id_produto"], arguments["data_inicio"], arguments["data_fim"])
                    print(f"Resultado da consulta: {resultado}")
                elif function_name == "selecionar_produto":
                    resultado = selecionar_produto()
                elif function_name == "buscar_produto":
                    resultado = buscar_produto(
                        arguments.get("query"),
                        arguments.get("search_type")
                    )

                elif function_name == "consultar_compras_por_periodo":
                    resultado = consultar_compras_por_periodo(
                        arguments.get("start_date"),
                        arguments.get("end_date")
                    )

                elif function_name == "consultar_itens_por_ids_de_compras":
                    resultado = consultar_itens_por_ids_de_compras(
                        arguments.get("purchase_ids")
                    )

                elif function_name == "analisar_vendas":
                    resultado = analisar_vendas(
                        arguments.get("product_id"),
                        arguments.get("start_date"),
                        arguments.get("end_date"),
                        arguments.get("comparison_type"),
                        arguments.get("is_second_product"),
                        arguments.get("first_product_id"),
                        arguments.get("compare_periods"),
                        arguments.get("second_start_date"),
                        arguments.get("second_end_date")
                    )

                elif function_name == "produtos_relacionados":
                    resultado = produtos_relacionados(
                        arguments.get("product_id"),
                        arguments.get("start_date"),
                        arguments.get("end_date")
                    )

                elif function_name == "historico_estoque":
                    resultado = historico_estoque(
                        arguments.get("query"),
                        arguments.get("search_type"),
                        arguments.get("start_date"),
                        arguments.get("end_date")
                    )

                elif function_name == "classificacao_estoque":
                    resultado = classificacao_estoque(
                        arguments.get("query"),
                        arguments.get("search_type")
                    )

                elif function_name == "total_estoque":
                    resultado = total_estoque()

                elif function_name == "itens_estoque":
                    resultado = itens_estoque()
                elif function_name == "vendas_total":
                    data_inicio = arguments.get("data_inicio")
                    data_fim = arguments.get("data_fim")
                    resultado = vendas_total(data_inicio=data_inicio, data_fim=data_fim)
                
                else:
                    raise HTTPException(status_code=400, detail="Função desconhecida")      

                messages.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [tool_call]
                })
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call_id,
                    "content": json.dumps(resultado,  default=str)
                })
                second_response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
                )
                resposta_final = second_response.choices[0].message.content
                return {"resposta": resposta_final}
             
            except Exception as e:
                print(f"ERRO na função {function_name}: {str(e)}")
                return JSONResponse(
                    status_code=500,
                    content={
                        "erro": f"Falha ao executar {function_name}",
                        "detalhes": str(e)
                    }
                )
            
        if not response_message.content:
            return JSONResponse(
                status_code=500,
                content={"erro": "A IA não achou nada"}
            )
        
        return {"resposta": response_message.content}
    except Exception as e:
        print(f"ERRO GERAL: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"erro": "Falha interna no servidor", "detalhes": str(e)}
        )
    finally:
        try:
            if cursor: cursor.close()
        except Exception as e:
            print(f"Erro ao fechar cursor: {str(e)}")
        try:
            if conn: conn.close()
        except Exception as e:
            print(f"Erro ao fechar conexão: {str(e)}")

    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)