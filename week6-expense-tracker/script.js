
"use strict";

// 1. Select HTML elements
const transactionForm = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const incomeDisplay = document.getElementById("total-income");
const expensesDisplay = document.getElementById("total-expenses");
const balanceDisplay = document.getElementById("balance");

const transactionList = document.getElementById("transaction-list");
const searchInput = document.getElementById("search");
const filterTypeInput = document.getElementById("filter-type");

// 2. Load saved transactions from browser storage
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

let nextId = transactions.length > 0
    ? Math.max(...transactions.map(function (transaction) {
        return transaction.id;
    })) + 1
    : 1;

// Save transactions in the browser
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// 3. Format amounts as Indian rupees
function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });
}

// 4. Calculate and update totals
function updateSummary() {
    const totalIncome = transactions
        .filter(function (transaction) {
            return transaction.type === "income";
        })
        .reduce(function (total, transaction) {
            return total + transaction.amount;
        }, 0);

    const totalExpenses = transactions
        .filter(function (transaction) {
            return transaction.type === "expense";
        })
        .reduce(function (total, transaction) {
            return total + transaction.amount;
        }, 0);

    incomeDisplay.textContent = formatMoney(totalIncome);
    expensesDisplay.textContent = formatMoney(totalExpenses);
    balanceDisplay.textContent = formatMoney(totalIncome - totalExpenses);
}

// 5. Display transactions with search and filtering
function displayTransactions() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedType = filterTypeInput.value;

    const filteredTransactions = transactions.filter(function (transaction) {
        const matchesSearch =
            transaction.description.toLowerCase().includes(searchText) ||
            transaction.category.toLowerCase().includes(searchText);

        const matchesType =
            selectedType === "all" || transaction.type === selectedType;

        return matchesSearch && matchesType;
    });

    transactionList.replaceChildren();

    if (filteredTransactions.length === 0) {
        const message = document.createElement("p");
        message.id = "empty-message";

        message.textContent = transactions.length === 0
            ? "No transactions yet. Add one above!"
            : "No matching transactions found.";

        transactionList.appendChild(message);
        return;
    }

    filteredTransactions.forEach(function (transaction) {
        const card = document.createElement("div");
        card.className = "transaction-item";

        const details = document.createElement("div");
        details.className = "transaction-details";

        const title = document.createElement("strong");
        title.textContent = transaction.description;

        const info = document.createElement("p");
        info.textContent =
            transaction.category + " | " +
            transaction.date + " | " +
            transaction.type;

        details.append(title, info);

        const amount = document.createElement("span");
        amount.className = transaction.type === "income"
            ? "income-amount"
            : "expense-amount";

        amount.textContent =
            (transaction.type === "income" ? "+" : "-") +
            formatMoney(transaction.amount);

        const actions = document.createElement("div");
        actions.className = "transaction-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editTransaction(transaction.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteTransaction(transaction.id);
        });

        actions.append(editButton, deleteButton);
        card.append(details, amount, actions);
        transactionList.appendChild(card);
    });
}

// 6. Add a transaction
transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (
        description === "" ||
        amountInput.value.trim() === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        date === ""
    ) {
        alert("Please enter a description, a positive amount, and a date.");
        return;
    }

    const transaction = {
        id: nextId,
        description: description,
        amount: amount,
        type: typeInput.value,
        category: categoryInput.value,
        date: date
    };

    nextId++;
    transactions.push(transaction);

    saveTransactions();
    updateSummary();
    displayTransactions();

    transactionForm.reset();
});

// 7. Edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(function (item) {
        return item.id === id;
    });

    if (!transaction) return;

    const newDescription = prompt(
        "Enter the new description:",
        transaction.description
    );

    if (newDescription === null) return;

    if (newDescription.trim() === "") {
        alert("Description cannot be empty.");
        return;
    }

    const newAmountText = prompt(
        "Enter the new amount:",
        String(transaction.amount)
    );

    if (newAmountText === null) return;

    const newAmount = Number(newAmountText);

    if (
        newAmountText.trim() === "" ||
        !Number.isFinite(newAmount) ||
        newAmount <= 0
    ) {
        alert("Please enter a valid positive amount.");
        return;
    }

    transaction.description = newDescription.trim();
    transaction.amount = newAmount;

    saveTransactions();
    updateSummary();
    displayTransactions();
}

// 8. Delete a transaction
function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    transactions = transactions.filter(function (item) {
        return item.id !== id;
    });

    saveTransactions();
    updateSummary();
    displayTransactions();
}

// 9. Search and filter transactions
searchInput.addEventListener("input", displayTransactions);
filterTypeInput.addEventListener("change", displayTransactions);

// 10. Display saved transactions when the page opens
updateSummary();
displayTransactions();

