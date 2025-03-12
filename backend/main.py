from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI(title="Sales Synergy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "user": "postgres",
    "password": "5842",
    "host": "localhost",
    "port": "5432",
    "database": "smart_metrics"
}

def get_db_connection():
    try:
        conn = psycopg2.connect(
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            cursor_factory=RealDictCursor
        )
        return conn
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)