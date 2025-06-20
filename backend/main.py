from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI(title="Sales Synergy API")

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


class PerguntaRequest(BaseModel):
    pergunta: str

@app.post("/analytics")
async def responder_pergunta(req: PerguntaRequest):
    pergunta = req.pergunta

    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("""
            WITH vendas_produto AS (
                SELECT id_produto, COUNT(*) AS total_vendido
                FROM itens_compra ic
                JOIN compra c ON ic.id_compra = c.id_compra
                WHERE c.data_compra BETWEEN CURRENT_DATE - INTERVAL '365 days' AND CURRENT_DATE
                GROUP BY id_produto
            )
            SELECT p.id_produto, p.nome_produto, vp.total_vendido, p.preco
            FROM produto p
            LEFT JOIN vendas_produto vp ON p.id_produto = vp.id_produto
            ORDER BY vp.total_vendido DESC NULLS LAST
            LIMIT 10;
        """)
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
        for v in vendas:
            total_vendido = v["total_vendido"] or 0
            resumo_vendas += f"- {v['nome_produto']}: {total_vendido} unidades vendidas, preço médio R$ {v['preco']:.2f}\n"

        resumo_estoque = "Estoque atual resumido:\n"
        for e in estoque:
            qtde = e["estoque_atual"] or 0
            val = e["valor_estoque"] or 0
            resumo_estoque += f"- {e['nome_produto']}: {qtde} unidades em estoque, valor aproximado R$ {val:.2f}\n"

        # Você pode juntar mais resumos com outras queries aqui...

        prompt = f"""
Você é um assistente inteligente de análises comerciais.

Dados do negócio:
{resumo_vendas}
{resumo_estoque}

Pergunta do usuário:
{pergunta}
"""

        resposta = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Você é um assistente de análise de vendas."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        return {"resposta": resposta.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na consulta: {str(e)}")
    finally:
        cursor.close()
        conn.close()


    
    #pergunta = req.pergunta

    #dados_do_negocio = """
    #Produto: Camiseta Preta
    #Vendas:
    #- Janeiro: 20 unidades
    #- Fevereiro: 35 unidades
    #- Março: 15 unidades
    #"""

    #try:
    #    resposta = client.chat.completions.create(
    #        model="gpt-4",  # ou "gpt-3.5-turbo"
    #        messages=[
     #           {"role": "system", "content": "Você é um assistente de análise de vendas."},
      #          {"role": "user", "content": f"Dados de vendas:\n{dados_do_negocio}\n\nPergunta: {pergunta}"}
       #     ],
        #    temperature=0.7
        #)

        #return {"resposta": resposta.choices[0].message.content}

    #except Exception as e:
     #   raise HTTPException(status_code=500, detail=f"Erro na consulta: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)