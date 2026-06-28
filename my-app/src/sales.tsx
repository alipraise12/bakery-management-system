import { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import "./sales.css";

function Sales() {

  const navigate = useNavigate();

  // ================= STATES =================

  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);

  const [customer, setCustomer] =
    useState<any>(null);

  // ================= SEARCH =================

  const [customerSearch, setCustomerSearch] =
    useState("");

  // ================= PAYMENT =================

  const [discount, setDiscount] =
    useState("");

  const [cash, setCash] =
    useState("");

  const [transfer, setTransfer] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  // ================= INVOICE =================

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const inputRefs = useRef<any[]>([]);

  // ================= FILTER CUSTOMER =================

  const filteredCustomers =
    customers.filter((c) => {

      const search =
        customerSearch.toLowerCase();

      return (

        c.name
          .toLowerCase()
          .includes(search)

        ||

        c.phone
          .toLowerCase()
          .includes(search)

      );

    });

  // ================= FORMAT MONEY =================

  const formatMoney = (value: any) => {

    return Number(
      value || 0
    ).toLocaleString();

  };

  // ================= CLEAN NUMBER =================

  const cleanNumber = (value: string) => {

    return value.replace(/,/g, "");

  };

  // ================= HANDLE MONEY INPUT =================

  const handleMoneyInput = (
    value: string,
    setter: any
  ) => {

    const cleaned =
      cleanNumber(value);

    if (!/^\d*$/.test(cleaned))
      return;

    setter(cleaned);

  };

  // ================= GENERATE TEMP INVOICE =================

  const generateTempInvoice = () => {

    const year =
      new Date().getFullYear();

    const random =
      Math.floor(
        1000 + Math.random() * 9000
      );

    return `INV-${year}-${random}`;

  };

  // ================= FETCH =================

  useEffect(() => {

    axios
      .get(
        "http://159.65.94.152/api/products/"
      )
      .then((res) =>
        setProducts(res.data)
      );

    axios
      .get(
        "http://159.65.94.152/api/customers/"
      )
      .then((res) =>
        setCustomers(res.data)
      );

    setRows([
      {
        productId: "",
        name: "",
        price: 0,
        quantity: "",
      },
    ]);

    setInvoiceNumber(
      generateTempInvoice()
    );

  }, []);

  // ================= ADD ROW =================

  const addRow = () => {

    setRows((prev) => [
      ...prev,
      {
        productId: "",
        name: "",
        price: 0,
        quantity: "",
      },
    ]);

  };

  // ================= REMOVE ROW =================

  const removeRow = (index: number) => {

    if (rows.length === 1)
      return;

    setRows(
      rows.filter(
        (_, i) => i !== index
      )
    );

  };

  // ================= SELECT PRODUCT =================

  const selectProduct = (
    index: number,
    productId: any
  ) => {

    const product =
      products.find(
        (p) =>
          p.id == productId
      );

    if (!product) return;

    const updated = [...rows];

    updated[index] = {
      ...updated[index],
      productId: product.id,
      name: product.name,
      price: product.price,
    };

    setRows(updated);

  };

  // ================= HANDLE QUANTITY =================

  const handleChange = (
    index: number,
    value: any
  ) => {

    const updated = [...rows];

    updated[index].quantity =
      value === ""
        ? ""
        : Math.max(
            0,
            Number(value)
          );

    setRows(updated);

  };

  // ================= HANDLE PRICE =================

  const handlePriceChange = (
    index: number,
    value: any
  ) => {

    const updated = [...rows];

    updated[index].price =
      value === ""
        ? 0
        : Number(value);

    setRows(updated);

  };

  // ================= KEYBOARD =================

  const handleKeyDown = (
    e: any,
    index: number
  ) => {

    if (e.key === "Enter") {

      e.preventDefault();

      if (
        index <
        rows.length - 1
      ) {

        inputRefs.current[
          index + 1
        ]?.focus();

      } else {

        addRow();

        setTimeout(() => {

          inputRefs.current[
            index + 1
          ]?.focus();

        }, 100);

      }
    }
  };

  // ================= CALCULATIONS =================

  const totalAmount =
    rows.reduce(
      (sum, r) =>
        sum +
        (
          r.price *
          (
            Number(
              r.quantity
            ) || 0
          )
        ),
      0
    );

  const finalTotal =
    totalAmount -
    (Number(discount) || 0);

  const totalAmountPaid =
    (Number(cash) || 0) +
    (Number(transfer) || 0);

  const balance =
    finalTotal -
    totalAmountPaid;

  // ================= SAVE SALES =================

  const saveSales = () => {

    if (!customer) {

      alert(
        "Select customer"
      );

      return;

    }

    const validRows =
      rows
        .filter(
          (r) =>
            r.productId &&
            r.quantity
        )
        .map((r) => ({
          ...r,
          price: Number(r.price)
        }));

    axios
      .post(
        "http://159.65.94.152/api/sales/",
        {

          customer_id:
            customer.id,

          rows: validRows,

          total: finalTotal,

          cash:
            Number(cash) || 0,

          transfer:
            Number(
              transfer
            ) || 0,

          paid:
            totalAmountPaid,

          balance:
            balance,

          payment_method:
            paymentMethod,

        }
      )
      .then((res) => {

        alert(
          "✅ Sale saved"
        );

        const realInvoice =
          res.data.invoice_number;

        setInvoiceNumber(
          realInvoice
        );

      })
      .catch((err) => {

        console.log(err);

        alert(
          "Failed to save sale"
        );

      });

  };

  // ================= NEW SALE =================

  const newSale = () => {

    if (
      !window.confirm(
        "Start new sale?"
      )
    )
      return;

    setRows([
      {
        productId: "",
        name: "",
        price: 0,
        quantity: "",
      },
    ]);

    setCustomer(null);

    setCustomerSearch("");

    setDiscount("");

    setCash("");

    setTransfer("");

    setPaymentMethod(
      "cash"
    );

    setInvoiceNumber(
      generateTempInvoice()
    );

  };

  // ================= PDF =================

  const generateInvoice = () => {

    if (!customer) {

      alert(
        "Select customer"
      );

      return;

    }

    const doc =
      new jsPDF();

    let y = 10;

    doc.setFontSize(16);

    doc.text(
      "SALES INVOICE",
      70,
      y
    );

    y += 12;

    doc.setFontSize(10);

    doc.text(
      `Invoice No: ${invoiceNumber}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Date: ${new Date().toLocaleString()}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Customer: ${customer.name}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Payment Method: ${paymentMethod.toUpperCase()}`,
      10,
      y
    );

    y += 10;

    // TABLE HEADER

    doc.text("S/N", 10, y);
    doc.text("Item", 30, y);
    doc.text("Qty", 90, y);
    doc.text("Price", 120, y);
    doc.text("Total", 160, y);

    y += 5;

    rows.forEach(
      (r, i) => {

        const qty =
          Number(
            r.quantity
          ) || 0;

        const total =
          r.price * qty;

        doc.text(
          String(i + 1),
          10,
          y
        );

        doc.text(
          r.name || "-",
          30,
          y
        );

        doc.text(
          String(qty),
          90,
          y
        );

        doc.text(
          `₦${formatMoney(r.price)}`,
          120,
          y
        );

        doc.text(
          `₦${formatMoney(total)}`,
          160,
          y
        );

        y += 7;

      }
    );

    y += 10;

    doc.text(
      `Total Amount: ₦${formatMoney(totalAmount)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Discount: ₦${formatMoney(discount)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Final Total: ₦${formatMoney(finalTotal)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Cash: ₦${formatMoney(cash)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Transfer: ₦${formatMoney(transfer)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Total Paid: ₦${formatMoney(totalAmountPaid)}`,
      10,
      y
    );

    y += 6;

    doc.text(
      `Balance: ₦${formatMoney(balance)}`,
      10,
      y
    );

    doc.save(
      `${invoiceNumber}.pdf`
    );

  };

  return (

    <div className="sales-container">

      <h2>
        🛒 Sales
      </h2>

      {/* CUSTOMER */}

      <div className="customer-box">

        <label>
          Select Customer
        </label>

        <input
          type="text"
          placeholder="Search by name or phone"
          className="customer-search"
          value={customerSearch}
          onChange={(e) =>
            setCustomerSearch(
              e.target.value
            )
          }
        />

        <select
          className="customer-select"
          value={
            customer?.id || ""
          }
          onChange={(e) => {

            const selected =
              customers.find(
                (c) =>
                  c.id ==
                  e.target.value
              );

            setCustomer(
              selected
            );

          }}
        >

          <option value="">
            Select Customer
          </option>

          {filteredCustomers.map(
            (c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
                {" "}
                (
                {c.phone}
                )
              </option>

            )
          )}

        </select>

      </div>

      {/* INVOICE */}

      <div className="invoice-box">

        <h3>
          Invoice:
          {" "}
          {invoiceNumber}
        </h3>

      </div>

      {/* TABLE */}

      <table className="sales-table">

        <thead>

          <tr>
            <th>S/N</th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {rows.map(
            (row, i) => (

              <tr key={i}>

                <td>
                  {i + 1}
                </td>

                <td>

                  <select
                    value={
                      row.productId
                    }
                    onChange={(e) =>
                      selectProduct(
                        i,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Product
                    </option>

                    {products.map(
                      (p) => (

                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.name}
                        </option>

                      )
                    )}

                  </select>

                </td>

                {/* EDITABLE PRICE */}

                <td>

                  <input
                    type="number"
                    value={row.price}
                    onChange={(e) =>
                      handlePriceChange(
                        i,
                        e.target.value
                      )
                    }
                  />

                </td>

                <td>

                  <input
                    ref={(el) =>
                      (
                        inputRefs.current[
                          i
                        ] = el
                      )
                    }
                    type="number"
                    value={
                      row.quantity
                    }
                    onChange={(e) =>
                      handleChange(
                        i,
                        e.target.value
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        i
                      )
                    }
                  />

                </td>

                <td>

                  ₦
                  {formatMoney(
                    row.price *
                    (
                      Number(
                        row.quantity
                      ) || 0
                    )
                  )}

                </td>

                <td>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      removeRow(i)
                    }
                  >
                    ❌
                  </button>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

      {/* ADD BUTTON */}

      <button
        className="add-btn"
        onClick={addRow}
      >
        ➕ Add Item
      </button>

      {/* SUMMARY */}

      <div className="summary-section">

        <h3>
          Payment Summary
        </h3>

        <div className="summary-grid">

          <div className="summary-item">

            <label>
              Total Amount
            </label>

            <input
              value={`₦${formatMoney(totalAmount)}`}
              readOnly
            />

          </div>

          <div className="summary-item">

            <label>
              Discount
            </label>

            <input
              type="text"
              value={formatMoney(
                discount
              )}
              onChange={(e) =>
                handleMoneyInput(
                  e.target.value,
                  setDiscount
                )
              }
              placeholder="0"
            />

          </div>

          <div className="summary-item">

            <label>
              Cash
            </label>

            <input
              type="text"
              value={formatMoney(
                cash
              )}
              onChange={(e) =>
                handleMoneyInput(
                  e.target.value,
                  setCash
                )
              }
              placeholder="0"
            />

          </div>

          <div className="summary-item">

            <label>
              Transfer
            </label>

            <input
              type="text"
              value={formatMoney(
                transfer
              )}
              onChange={(e) =>
                handleMoneyInput(
                  e.target.value,
                  setTransfer
                )
              }
              placeholder="0"
            />

          </div>

          <div className="summary-item">

            <label>
              Total Amount Paid
            </label>

            <input
              value={`₦${formatMoney(totalAmountPaid)}`}
              readOnly
            />

          </div>

          <div className="summary-item">

            <label>
              Balance
            </label>

            <input
              value={`₦${formatMoney(balance)}`}
              readOnly
            />

          </div>

          <div className="summary-item">

            <label>
              Payment Method
            </label>

            <select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            >

              <option value="cash">
                Cash
              </option>

              <option value="transfer">
                Transfer
              </option>

              <option value="cash/transfer">
                Cash/Transfer
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* BUTTONS */}

      <div className="button-group">

        <button
          className="save-btn"
          onClick={saveSales}
        >
          💾 Save
        </button>

        <button
          className="invoice-btn"
          onClick={
            generateInvoice
          }
        >
          📄 Invoice PDF
        </button>

        <button
          className="new-btn"
          onClick={newSale}
        >
          🆕 New Sale
        </button>

        <button
          className="ledger-btn"
          onClick={() => {

            if (!customer) {

              alert(
                "Please select customer first"
              );

              return;

            }

            navigate(
              `/customer-ledger/${customer.id}`
            );

          }}
        >
          📒 Customer Ledger
        </button>

      </div>

    </div>

  );
}

export default Sales;