import gspread
import pandas as pd

from datetime import datetime

from django.core.mail import EmailMessage

from oauth2client.service_account import (
    ServiceAccountCredentials
)


def send_attendance_report():

    try:

        # =====================
        # CURRENT DATE
        # =====================

        today = datetime.now()

        today_string = today.strftime(
            "%Y-%m-%d"
        )

        # =====================
        # DAILY COUNTERS
        # =====================

        attendance_count = 0
        sales_count = 0
        dispatch_count = 0
        inventory_count = 0
        customers_count = 0

        # =====================
        # GOOGLE SHEET ACCESS
        # =====================

        scope = [

            "https://spreadsheets.google.com/feeds",

            "https://www.googleapis.com/auth/drive"

        ]

        creds = (
            ServiceAccountCredentials
            .from_json_keyfile_name(
                "credentials.json",
                scope
            )
        )

        client = gspread.authorize(creds)

        spreadsheet = client.open(
            "Bakery management systems"
        )

        # =====================
        # CREATE EXCEL FILE
        # =====================

        excel_file = (
            f"Daily_Bakery_Report_"
            f"{today.strftime('%Y-%m-%d')}.xlsx"
        )

        with pd.ExcelWriter(
            excel_file,
            engine="openpyxl"
        ) as writer:

            worksheets = [

                "Attendance",

                "Sales",

                "Dispatch",

                "Inventory",

                "Customers"
            ]

            for sheet_name in worksheets:

                try:

                    sheet = spreadsheet.worksheet(
                        sheet_name
                    )

                    data = sheet.get_all_values()

                    if not data:

                        continue

                    headers = data[0]

                    rows = data[1:]

                    filtered_rows = []

                    # =====================
                    # FILTER TODAY'S RECORDS
                    # =====================

                    for row in rows:

                        try:

                            # Attendance, Inventory, Customers
                            if sheet_name in [

                                "Attendance",

                                "Inventory",

                                "Customers"

                            ]:

                                if (

                                    len(row) > 0

                                    and

                                    row[0].startswith(
                                        today_string
                                    )
                                ):

                                    filtered_rows.append(
                                        row
                                    )

                            # Sales, Dispatch
                            else:

                                if (

                                    len(row) > 5

                                    and

                                    row[5].startswith(
                                        today_string
                                    )
                                ):

                                    filtered_rows.append(
                                        row
                                    )

                        except:

                            pass

                    # =====================
                    # SAVE COUNTS
                    # =====================

                    count = len(
                        filtered_rows
                    )

                    if sheet_name == "Attendance":

                        attendance_count = count

                    elif sheet_name == "Sales":

                        sales_count = count

                    elif sheet_name == "Dispatch":

                        dispatch_count = count

                    elif sheet_name == "Inventory":

                        inventory_count = count

                    elif sheet_name == "Customers":

                        customers_count = count

                    # =====================
                    # EXPORT ONLY TODAY
                    # =====================

                    df = pd.DataFrame(

                        filtered_rows,

                        columns=headers
                    )

                    df.to_excel(

                        writer,

                        sheet_name=sheet_name,

                        index=False
                    )

                    print(
                        f"{sheet_name} exported successfully"
                    )

                except Exception as e:

                    print(
                        f"Could not export {sheet_name}"
                    )

                    print(str(e))

        # =====================
        # GOOGLE SHEET LINK
        # =====================

        sheet_link = (
            "https://docs.google.com/spreadsheets/d/"
            "13GHFrN9TKnqZmEPHFU9XQhbFT5TINX9xdDp5wO95HA8"
        )

        # =====================
        # SEND EMAIL
        # =====================

        email = EmailMessage(

            subject=(

                f"Daily Bakery Report - "

                f"{today.strftime('%d %B %Y')}"
            ),

            body=f"""
Good Evening,

Today's bakery report is available at:

{sheet_link}

=========================
DAILY SUMMARY
=========================

Attendance Records: {attendance_count}

Sales Records: {sales_count}

Dispatch Records: {dispatch_count}

Inventory Records: {inventory_count}

Customers Added: {customers_count}

=========================

The attached Excel file contains
ONLY today's records.

Report Date:
{today.strftime('%d %B %Y')}

Regards,
Bakery Management System
""",

            to=[
                "alipraise60@gmail.com"
            ]
        )

        email.attach_file(
            excel_file
        )

        email.send()

        print(
            "BAKERY REPORT SENT"
        )

    except Exception as e:

        import traceback

        print(
            "EMAIL REPORT ERROR"
        )

        traceback.print_exc()














# import gspread
# import pandas as pd

# from datetime import datetime

# from django.core.mail import EmailMessage

# from oauth2client.service_account import (
#     ServiceAccountCredentials
# )


# def send_attendance_report():

#     try:

#         # =====================
#         # CURRENT DATE
#         # =====================

#         today = datetime.now()

#         today_string = today.strftime(
#             "%Y-%m-%d"
#         )

#         # =====================
#         # DAILY COUNTERS
#         # =====================

#         attendance_count = 0

#         sales_count = 0

#         dispatch_count = 0

#         inventory_count = 0

#         customers_count = 0

#         # =====================
#         # GOOGLE SHEET ACCESS
#         # =====================

#         scope = [

#             "https://spreadsheets.google.com/feeds",

#             "https://www.googleapis.com/auth/drive"
#         ]

#         creds = (
#             ServiceAccountCredentials
#             .from_json_keyfile_name(
#                 "credentials.json",
#                 scope
#             )
#         )

#         client = gspread.authorize(creds)

#         spreadsheet = client.open(
#             "Bakery management systems"
#         )

#         # =====================
#         # CREATE EXCEL FILE
#         # =====================

#         excel_file = (
#             f"Daily_Bakery_Report_"
#             f"{today.strftime('%Y-%m-%d')}.xlsx"
#         )

#         with pd.ExcelWriter(
#             excel_file,
#             engine="openpyxl"
#         ) as writer:

#             worksheets = [

#                 "Attendance",

#                 "Sales",

#                 "Dispatch",

#                 "Inventory",

#                 "Customers"
#             ]

#             for sheet_name in worksheets:

#                 try:

#                     sheet = spreadsheet.worksheet(
#                         sheet_name
#                     )

#                     data = sheet.get_all_values()

#                     # =====================
#                     # COUNT TODAY'S RECORDS
#                     # =====================

#                     if len(data) > 1:

#                         rows = data[1:]

#                         if sheet_name in [

#                             "Attendance",

#                             "Inventory",

#                             "Customers"

#                         ]:

#                             count = sum(

#                                 1

#                                 for row in rows

#                                 if len(row) > 0

#                                 and row[0].startswith(
#                                     today_string
#                                 )
#                             )

#                         else:

#                             count = sum(

#                                 1

#                                 for row in rows

#                                 if len(row) > 5

#                                 and row[5].startswith(
#                                     today_string
#                                 )
#                             )

#                         if sheet_name == "Attendance":

#                             attendance_count = count

#                         elif sheet_name == "Sales":

#                             sales_count = count

#                         elif sheet_name == "Dispatch":

#                             dispatch_count = count

#                         elif sheet_name == "Inventory":

#                             inventory_count = count

#                         elif sheet_name == "Customers":

#                             customers_count = count

#                     # =====================
#                     # EXPORT SHEET
#                     # =====================

#                     if data:

#                         headers = data[0]

#                         rows = data[1:]

#                         df = pd.DataFrame(
#                             rows,
#                             columns=headers
#                         )

#                     else:

#                         df = pd.DataFrame()

#                     df.to_excel(

#                         writer,

#                         sheet_name=sheet_name,

#                         index=False
#                     )

#                     print(
#                         f"{sheet_name} exported successfully"
#                     )

#                 except Exception as e:

#                     print(
#                         f"Could not export {sheet_name}"
#                     )

#                     print(str(e))

#         # =====================
#         # GOOGLE SHEET LINK
#         # =====================

#         sheet_link = (
#             "https://docs.google.com/spreadsheets/d/"
#             "13GHFrN9TKnqZmEPHFU9XQhbFT5TINX9xdDp5wO95HA8"
#         )

#         # =====================
#         # SEND EMAIL
#         # =====================

#         email = EmailMessage(

#             subject=(

#                 f"Daily Bakery Report - "

#                 f"{today.strftime('%d %B %Y')}"
#             ),

#             body=f"""
# Good Evening,

# Today's bakery report is available at:

# {sheet_link}

# =========================
# DAILY SUMMARY
# =========================

# Attendance Records: {attendance_count}

# Sales Records: {sales_count}

# Dispatch Records: {dispatch_count}

# Inventory Records: {inventory_count}

# Customers Added: {customers_count}

# =========================

# The Excel report is attached.

# Report Date:
# {today.strftime('%d %B %Y')}

# Regards,
# Bakery Management System
# """,

#             to=[
#                 "alipraise60@gmail.com"
#             ]
#         )

#         email.attach_file(
#             excel_file
#         )

#         email.send()

#         print(
#             "BAKERY REPORT SENT"
#         )

#     except Exception as e:

#         import traceback

#         print(
#             "EMAIL REPORT ERROR"
#         )

#         traceback.print_exc()









