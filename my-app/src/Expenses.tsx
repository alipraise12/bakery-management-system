import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_URL from "./api";
import "./Expenses.css";

interface Supplier {
    id: number;
    name: string;
}

interface ExpenseItem {
    id: number;
    name: string;
}

interface PurchaseItem {
    id: number;
    supplier: string;
    expenseItem: string;
    supplierInvoice: string;
    cashPaid: number;
    transferPaid: number;
    total: number;
    discount: number;
    netTotal: number;
}

const Expense: React.FC = () => {

    // ==========================================
    // VOUCHER DETAILS
    // ==========================================

    const [voucherNumber, setVoucherNumber] = useState("");

    const [purchaseDate, setPurchaseDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    // ==========================================
    // RECEIPT
    // ==========================================

    const [receipt, setReceipt] = useState<File | null>(null);

    const [receiptPreview, setReceiptPreview] = useState("");

    // ==========================================
    // DROPDOWNS
    // ==========================================

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);

    // ==========================================
    // PURCHASE ITEMS
    // ==========================================

    const [items, setItems] = useState<PurchaseItem[]>([
        {
            id: Date.now(),
            supplier: "",
            expenseItem: "",
            supplierInvoice: "",
            cashPaid: 0,
            transferPaid: 0,
            total: 0,
            discount: 0,
            netTotal: 0,
        },
    ]);

    // ==========================================
    // GRAND TOTAL
    // ==========================================

    const grandTotal = useMemo(() => {

        return items.reduce((sum, item) => {

            return sum + item.netTotal;

        }, 0);

    }, [items]);

    // ==========================================
    // LOAD INITIAL DATA
    // ==========================================

    useEffect(() => {

        generateVoucherNumber();

        loadSuppliers();

        loadExpenseItems();

    }, []);

    // ==========================================
    // GENERATE VOUCHER NUMBER
    // ==========================================

    const generateVoucherNumber = () => {

        const now = new Date();

        const number =
            "PV-" +
            now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, "0") +
            String(now.getDate()).padStart(2, "0") +
            "-" +
            Math.floor(Math.random() * 9000 + 1000);

        setVoucherNumber(number);

    };

    // ==========================================
    // LOAD SUPPLIERS
    // ==========================================

    const loadSuppliers = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/api/suppliers/`
            );

            setSuppliers(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    // ==========================================
    // LOAD EXPENSE ITEMS
    // ==========================================

    const loadExpenseItems = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/api/expense-items/`
            );

            setExpenseItems(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    // ==========================================
    // RECEIPT
    // ==========================================

    const handleReceiptChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        setReceipt(file);

        if (file.type.startsWith("image/")) {

            setReceiptPreview(
                URL.createObjectURL(file)
            );

        } else {

            setReceiptPreview("");

        }

    };

    const removeReceipt = () => {

        setReceipt(null);

        setReceiptPreview("");

    };




        // ==========================================
    // PURCHASE ITEM FUNCTIONS
    // ==========================================

    const addRow = () => {

        setItems([
            ...items,
            {
                id: Date.now(),
                supplier: "",
                expenseItem: "",
                supplierInvoice: "",
                cashPaid: 0,
                transferPaid: 0,
                total: 0,
                discount: 0,
                netTotal: 0,
            },
        ]);

    };

    const removeRow = (id: number) => {

        if (items.length === 1) {

            return;

        }

        setItems(
            items.filter((item) => item.id !== id)
        );

    };

    const handleItemChange = (
        id: number,
        field: keyof PurchaseItem,
        value: string | number
    ) => {

        const updatedItems = items.map((item) => {

            if (item.id !== id) {

                return item;

            }

            const updatedItem = {
                ...item,
                [field]: value,
            };

            updatedItem.total =
                Number(updatedItem.cashPaid) +
                Number(updatedItem.transferPaid);

            updatedItem.netTotal =
                updatedItem.total -
                Number(updatedItem.discount);

            return updatedItem;

        });

        setItems(updatedItems);

    };

    // ==========================================
    // SAVE PURCHASE VOUCHER
    // ==========================================

    const savePurchaseVoucher = async () => {

        try {

            const formData = new FormData();

            formData.append(
                "voucher_number",
                voucherNumber
            );

            formData.append(
                "purchase_date",
                purchaseDate
            );

            if (receipt) {

                formData.append(
                    "receipt",
                    receipt
                );

            }

            formData.append(
                "grand_total",
                grandTotal.toString()
            );

            formData.append(
                "items",
                JSON.stringify(items)
            );

            await axios.post(

                `${API_URL}/api/purchase-vouchers/`,

                formData,

                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }

            );

            alert(
                "Purchase Voucher saved successfully."
            );

        } catch (error) {

            console.log(error);

            alert(
                "Failed to save Purchase Voucher."
            );

        }

    };

    return (

        <div className="expense-container">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="expense-header">

                <h1>

                    Purchase Voucher

                </h1>

            </div>

            {/* ==========================================
                VOUCHER DETAILS
            ========================================== */}

            <div className="expense-card">

                <h2>

                    Voucher Details

                </h2>

                <div className="form-row">

                    <div className="form-group">

                        <label>

                            Voucher Number

                        </label>

                        <input
                            type="text"
                            value={voucherNumber}
                            readOnly
                        />

                    </div>

                    <div className="form-group">

                        <label>

                            Purchase Date

                        </label>

                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) =>
                                setPurchaseDate(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>

            </div>

            {/* ==========================================
                RECEIPT
            ========================================== */}

            <div className="expense-card">

                <h2>

                    Receipt

                </h2>

                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    capture="environment"
                    onChange={handleReceiptChange}
                />

                {receipt && (

                    <div className="receipt-preview-container">

                        <p>

                            {receipt.name}

                        </p>

                        {receiptPreview ? (

                            <img
                                src={receiptPreview}
                                alt="Receipt"
                                className="receipt-preview"
                            />

                        ) : (

                            <p>

                                📄 PDF Selected

                            </p>

                        )}

                        <button
                            type="button"
                            onClick={removeReceipt}
                        >

                            Remove Receipt

                        </button>

                    </div>

                )}

            </div>


                {/* ==========================================
                PURCHASE ITEMS
            ========================================== */}

            <div className="expense-card">

                <div className="table-header">

                    <h2>

                        Purchase Items

                    </h2>

                    <button
                        type="button"
                        onClick={addRow}
                    >

                        + Add Item

                    </button>

                </div>
            <div className="expense-table">
                <table>

                    <thead>

                        <tr>

                            <th>Supplier</th>

                            <th>Expense Item</th>

                            <th>Supplier Invoice</th>

                            <th>Cash Paid</th>

                            <th>Transfer Paid</th>

                            <th>Total</th>

                            <th>Discount</th>

                            <th>Net Total</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {items.map((item) => (

                            <tr key={item.id}>

                                <td>

                                    <select
                                        value={item.supplier}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "supplier",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">

                                            Select Supplier

                                        </option>

                                        {suppliers.map((supplier) => (

                                            <option
                                                key={supplier.id}
                                                value={supplier.id}
                                            >

                                                {supplier.name}

                                            </option>

                                        ))}

                                    </select>

                                </td>

                                <td>

                                    <select
                                        value={item.expenseItem}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "expenseItem",
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">

                                            Select Expense Item

                                        </option>

                                        {expenseItems.map((expense) => (

                                            <option
                                                key={expense.id}
                                                value={expense.id}
                                            >

                                                {expense.name}

                                            </option>

                                        ))}

                                    </select>

                                </td>

                                <td>

                                    <input
                                        type="text"
                                        value={item.supplierInvoice}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "supplierInvoice",
                                                e.target.value
                                            )
                                        }
                                    />

                                </td>

                                <td>

                                    <input
                                        type="number"
                                        value={item.cashPaid}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "cashPaid",
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    />

                                </td>

                                <td>

                                    <input
                                        type="number"
                                        value={item.transferPaid}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "transferPaid",
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    />

                                </td>

                                <td>

                                    ₦{item.total.toLocaleString()}

                                </td>

                                <td>

                                    <input
                                        type="number"
                                        value={item.discount}
                                        onChange={(e) =>
                                            handleItemChange(
                                                item.id,
                                                "discount",
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                    />

                                </td>

                                <td>

                                    ₦{item.netTotal.toLocaleString()}

                                </td>

                                <td>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeRow(item.id)
                                        }
                                    >

                                        Delete

                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

</div>
{/* ==========================================
    MOBILE PURCHASE CARDS
========================================== */}

<div className="expense-cards">

    {items.map((item) => (

        <div
            className="expense-item-card"
            key={item.id}
        >

            <div className="form-group">

                <label>Supplier</label>

                <select
                    value={item.supplier}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "supplier",
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Select Supplier
                    </option>

                    {suppliers.map((supplier) => (

                        <option
                            key={supplier.id}
                            value={supplier.id}
                        >

                            {supplier.name}

                        </option>

                    ))}

                </select>

            </div>

            <div className="form-group">

                <label>Expense Item</label>

                <select
                    value={item.expenseItem}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "expenseItem",
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Select Expense Item
                    </option>

                    {expenseItems.map((expense) => (

                        <option
                            key={expense.id}
                            value={expense.id}
                        >

                            {expense.name}

                        </option>

                    ))}

                </select>

            </div>

            <div className="form-group">

                <label>Supplier Invoice</label>

                <input
                    type="text"
                    value={item.supplierInvoice}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "supplierInvoice",
                            e.target.value
                        )
                    }
                />

            </div>

            <div className="form-group">

                <label>Cash Paid</label>

                <input
                    type="number"
                    value={item.cashPaid}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "cashPaid",
                            Number(e.target.value)
                        )
                    }
                />

            </div>

            <div className="form-group">

                <label>Transfer Paid</label>

                <input
                    type="number"
                    value={item.transferPaid}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "transferPaid",
                            Number(e.target.value)
                        )
                    }
                />

            </div>

            <div className="form-group">

                <label>Discount</label>

                <input
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                        handleItemChange(
                            item.id,
                            "discount",
                            Number(e.target.value)
                        )
                    }
                />

            </div>

            <div className="expense-summary">

                <strong>
                    Total:
                </strong>

                ₦{item.total.toLocaleString()}

            </div>

            <div className="expense-summary">

                <strong>
                    Net Total:
                </strong>

                ₦{item.netTotal.toLocaleString()}

            </div>

            <button
                type="button"
                className="delete-item-btn"
                onClick={() => removeRow(item.id)}
            >

                🗑 Delete Item

            </button>

        </div>

    ))}

</div>


            </div>

            {/* ==========================================
                GRAND TOTAL
            ========================================== */}

            <div className="expense-card">

                <h2>

                    Grand Total

                </h2>

                <h1>

                    ₦{grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}

                </h1>

            </div>

            {/* ==========================================
                SAVE BUTTON
            ========================================== */}

            <div className="button-section">

                <button
                    type="button"
                    onClick={savePurchaseVoucher}
                >

                    Save Purchase Voucher

                </button>

            </div>

        </div>

    );

};

export default Expense;