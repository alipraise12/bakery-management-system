import gspread

from oauth2client.service_account import (
    ServiceAccountCredentials
)

from datetime import datetime


# =====================================
# SALES
# =====================================

def save_sale_to_sheet(

    invoice_number,

    customer_name,

    bread_type,

    quantity,

    amount

):

    try:

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

        spreadsheet = client.open_by_key(
            "13GHFrN9TKnqZmEPHFU9XQhbFT5TINX9xdDp5wO95HA8"
        )

        sales_sheet = spreadsheet.worksheet(
            "Sales"
        )

        sales_sheet.append_row([

            invoice_number,

            customer_name,

            bread_type,

            quantity,

            amount,

            str(datetime.now())
        ])

        print("Google Sheet Saved Successfully")

    except Exception as e:

        print("GOOGLE SHEET ERROR:")

        import traceback

        traceback.print_exc()


# =====================================
# DISPATCH
# =====================================

def save_dispatch_to_sheet(

    invoice_number,

    customer_name,

    bread_type,

    quantity_given,

    receiver

):

    try:

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

        dispatch_sheet = spreadsheet.worksheet(
            "Dispatch"
        )

        dispatch_sheet.append_row([

            invoice_number,

            customer_name,

            bread_type,

            quantity_given,

            receiver,

            str(datetime.now())
        ])

        print("DISPATCH SAVED TO GOOGLE SHEET")

    except Exception as e:

        import traceback

        print("DISPATCH GOOGLE ERROR")

        traceback.print_exc()


# =====================================
# INVENTORY
# =====================================

def save_inventory_to_sheet(

    product,

    stock_in,

    stock_out

):

    try:

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

        inventory_sheet = spreadsheet.worksheet(
            "Inventory"
        )

        available_stock = (
            int(stock_in) - int(stock_out)
        )

        inventory_sheet.append_row([

            str(datetime.now()),

            product,

            stock_in,

            stock_out,

            available_stock
        ])

        print("INVENTORY SAVED TO GOOGLE SHEET")

    except Exception as e:

        import traceback

        print("INVENTORY GOOGLE ERROR")

        traceback.print_exc()



def save_inventory_to_sheet(

    product,

    stock_in,

    stock_out

):

    try:

        # =========================
        # GOOGLE SHEET ACCESS
        # =========================

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

        # =========================
        # OPEN SPREADSHEET
        # =========================

        spreadsheet = client.open(
            "Bakery management systems"
        )

        # =========================
        # OPEN INVENTORY TAB
        # =========================

        inventory_sheet = spreadsheet.worksheet(
            "Inventory"
        )

        # =========================
        # CALCULATE AVAILABLE STOCK
        # =========================

        available_stock = (

            int(stock_in)

            -

            int(stock_out)
        )

        # =========================
        # SAVE TO SHEET
        # =========================

        inventory_sheet.append_row([

            str(datetime.now()),

            product,

            stock_in,

            stock_out,

            available_stock
        ])

        print(
            "INVENTORY SAVED TO GOOGLE SHEET"
        )

    except Exception as e:

        import traceback

        print(
            "INVENTORY GOOGLE SHEET ERROR"
        )

        traceback.print_exc()


# =====================================
# CUSTOMERS
# =====================================

def save_customer_to_sheet(

    customer_name,

    phone_number

):

    try:

        # =========================
        # GOOGLE SHEET ACCESS
        # =========================

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

        # =========================
        # OPEN SPREADSHEET
        # =========================

        spreadsheet = client.open(
            "Bakery management systems"
        )

        # =========================
        # OPEN CUSTOMERS TAB
        # =========================

        customers_sheet = spreadsheet.worksheet(
            "Customers"
        )

        # =========================
        # SAVE TO SHEET
        # =========================

        customers_sheet.append_row([

            str(datetime.now()),

            customer_name,

            phone_number
        ])

        print(
            "CUSTOMER SAVED TO GOOGLE SHEET"
        )

    except Exception as e:

        import traceback

        print(
            "CUSTOMER GOOGLE SHEET ERROR"
        )

        traceback.print_exc()




# =====================================
# ATTENDANCE
# =====================================

# =====================================
# ATTENDANCE
# =====================================

def save_attendance_to_sheet(

    staff_name,

    phone,

    time_in,

    time_out

):

    try:

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

        attendance_sheet = spreadsheet.worksheet(
            "Attendance"
        )

        # =========================
        # FIRST SCAN → ADD NEW ROW
        # =========================

        if time_out == "":

            attendance_sheet.append_row([

                str(datetime.now()),

                staff_name,

                phone,

                str(time_in),

                ""
            ])

            print(
                "TIME IN SAVED TO GOOGLE SHEET"
            )

        # =========================
        # SECOND SCAN → UPDATE ROW
        # =========================

        else:

            records = attendance_sheet.get_all_values()

            # START FROM ROW 2
            for index, row in enumerate(
                records[1:],
                start=2
            ):

                row_name = row[1]

                row_phone = row[2]

                row_time_out = row[4]

                # FIND EMPTY TIME OUT
                if (

                    row_name == staff_name

                    and

                    row_phone == phone

                    and

                    row_time_out == ""
                ):

                    # COLUMN E = TIME OUT
                    attendance_sheet.update(

                        f"E{index}",

                        [[str(time_out)]]
                    )

                    print(
                        "TIME OUT UPDATED"
                    )

                    break

    except Exception as e:

        import traceback

        print(
            "ATTENDANCE GOOGLE SHEET ERROR"
        )

        traceback.print_exc()












