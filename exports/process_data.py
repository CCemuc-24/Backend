#!/usr/bin/env python3
import pandas as pd
import json
import re
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# Custom parser para Courses CSV debido a JSON anidado
def parse_courses_csv(filepath):
    courses_list = []
    with open(filepath, 'r', encoding='utf-8') as f:
        # Skip header
        header = f.readline()
        # El archivo está delimitado por comas, pero algunos campos contienen JSON
        # Estrategia: buscar patrones UUID como delimitador de fila
        uuid_pattern = r'^[a-f0-9\-]{36},'

        for line in f:
            line = line.strip()
            if not line:
                continue

            # Extraer campos usando regex para el patrón general
            match = re.match(
                r'^([a-f0-9\-]{36}),\s*(.+?),\s*(\d+),\s*(core|elective|workshop),\s*(\d+),\s*(\d+),',
                line
            )
            if match:
                course_id, title, module, course_type, price, capacity = match.groups()
                courses_list.append({
                    'id': course_id,
                    'title': title.strip(),
                    'module': int(module),
                    'type': course_type,
                    'price': int(price),
                    'capacity': int(capacity)
                })

    return pd.DataFrame(courses_list)

print("Leyendo archivos CSV...")
users = pd.read_csv('exports/Users.csv', encoding='utf-8')
courses = parse_courses_csv('exports/Courses.csv')
enrollments = pd.read_csv('exports/Enrollments.csv', encoding='utf-8')
purchases = pd.read_csv('exports/Purchases.csv', encoding='utf-8')

# Limpiar espacios
users.columns = users.columns.str.strip()
enrollments.columns = enrollments.columns.str.strip()
purchases.columns = purchases.columns.str.strip()

print(f"✓ Usuarios: {len(users)}")
print(f"✓ Cursos: {len(courses)}")
print(f"✓ Enrollments: {len(enrollments)}")
print(f"✓ Purchases: {len(purchases)}")

# ============================================================
# PROCESAMIENTO: USUARIOS
# ============================================================
users_clean = users[['id', 'rut', 'names', 'lastNames', 'email', 'university', 'carrerYear']].copy()
users_clean.columns = ['userId', 'RUT', 'Nombre', 'Apellido', 'Email', 'Universidad', 'Año']
users_clean = users_clean.drop_duplicates()

# ============================================================
# PROCESAMIENTO: CURSOS
# ============================================================
courses_clean = courses[['id', 'title', 'type', 'module', 'price']].copy()
courses_clean.columns = ['courseId', 'Nombre Curso', 'Tipo', 'Módulo', 'Precio']

# ============================================================
# PROCESAMIENTO: VENTAS
# ============================================================
# Obtener solo compras pagadas
paid_purchases = purchases[purchases['isPaid'] == 't'][['id', 'createdAt']].copy()
paid_purchases.columns = ['purchaseId', 'Fecha Pago']

# Mergear enrollments con compras pagadas
sales_raw = enrollments.merge(paid_purchases, on='purchaseId', how='inner')

# Mergear con usuarios
sales_raw = sales_raw.merge(users_clean[['userId', 'RUT', 'Nombre', 'Apellido']], on='userId', how='left')

# Mergear con cursos
sales_raw = sales_raw.merge(courses_clean[['courseId', 'Nombre Curso', 'Precio']], on='courseId', how='left')

# Seleccionar y renombrar columnas finales
sales = sales_raw[['RUT', 'Nombre', 'Apellido', 'Nombre Curso', 'Precio', 'Fecha Pago']].copy()
sales.columns = ['RUT', 'Nombre Usuario', 'Apellido', 'Curso', 'Precio', 'Fecha Pago']

# Parsear fechas
sales['Fecha Pago'] = pd.to_datetime(sales['Fecha Pago'], utc=True)
sales['Fecha Pago'] = sales['Fecha Pago'].dt.strftime('%Y-%m-%d %H:%M')

# Combinar nombre y apellido
sales['Alumno'] = sales['Nombre Usuario'] + ' ' + sales['Apellido']
sales = sales[['RUT', 'Alumno', 'Curso', 'Precio', 'Fecha Pago']]
sales = sales.drop_duplicates()

# ============================================================
# ESTADÍSTICAS
# ============================================================
total_entradas_vendidas = len(sales)
ingresos_totales = sales['Precio'].sum()

# Ventas por curso
ventas_por_curso = sales.groupby('Curso').agg({
    'RUT': 'count',
    'Precio': 'sum'
}).rename(columns={'RUT': 'Cantidad Vendida', 'Precio': 'Ingresos'})
ventas_por_curso = ventas_por_curso.reset_index()

print(f"\n{'='*60}")
print(f"RESUMEN DE VENTAS - AÑO 2024")
print(f"{'='*60}")
print(f"Total de entradas vendidas: {total_entradas_vendidas}")
print(f"Ingresos totales: ${ingresos_totales:,.0f}")
print(f"\nTop cursos por ventas:")
print(ventas_por_curso.sort_values('Cantidad Vendida', ascending=False).head(10).to_string(index=False))
print(f"{'='*60}\n")

# ============================================================
# CREAR EXCEL
# ============================================================
print("Creando archivo Excel...")
output_file = 'exports/CCemuc_Datos_2024.xlsx'

with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    # Resumen
    summary_data = {
        'Métrica': [
            'Total Entradas Vendidas',
            'Ingresos Totales',
            'Usuarios Únicos',
            'Cursos Disponibles'
        ],
        'Valor': [
            total_entradas_vendidas,
            f'${ingresos_totales:,.0f}',
            len(users_clean),
            len(courses_clean)
        ]
    }
    pd.DataFrame(summary_data).to_excel(writer, sheet_name='Resumen', index=False)

    # Usuarios
    users_final = users_clean[['RUT', 'Nombre', 'Apellido', 'Email', 'Universidad', 'Año']]
    users_final.to_excel(writer, sheet_name='Usuarios', index=False)

    # Cursos
    courses_final = courses_clean[['Nombre Curso', 'Tipo', 'Módulo', 'Precio']]
    courses_final.columns = ['Nombre', 'Tipo', 'Módulo', 'Precio']
    courses_final.to_excel(writer, sheet_name='Cursos', index=False)

    # Ventas Detalladas
    sales.to_excel(writer, sheet_name='Ventas Detalladas', index=False)

    # Ventas por Curso
    ventas_por_curso.to_excel(writer, sheet_name='Ventas por Curso', index=False)

# ============================================================
# FORMATEAR EXCEL
# ============================================================
print("Formateando Excel...")
wb = load_workbook(output_file)

header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
header_font = Font(bold=True, color="FFFFFF", size=11)
border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

for sheet_name in wb.sheetnames:
    ws = wb[sheet_name]

    # Auto-ancho
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width

    # Encabezados
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = border

    # Datos
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
        for cell in row:
            cell.border = border
            cell.alignment = Alignment(horizontal='left')

    ws.row_dimensions[1].height = 25

wb.save(output_file)
print(f"✓ Excel guardado en: {output_file}")
print(f"✓ Hojas creadas: {', '.join(wb.sheetnames)}")
print(f"✓ Archivo listo para descargar desde: ./exports/{output_file.split('/')[-1]}")
