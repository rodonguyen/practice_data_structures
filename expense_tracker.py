import csv
import os
from tabulate import tabulate

# Categories for expenses (excluding 'Done')
CATEGORIES = [
    "Groceries",
    "Lunch / normal meals",
    "Luxury eat-out",
    "Bill",
    "Transportation",
    "Hangout w Friends",
    "GF",
    "Once in a while necessities",
    "Travelling",
    "Clothing",
    "Sports & Health",
    "Tool 4 Work",
    "Learning",
    "Investing",
    "Family",
]

# Short names for display
SHORT_NAMES = {
    "Groceries": "Groc",
    "Lunch / normal meals": "Lunch",
    "Luxury eat-out": "Luxury",
    "Bill": "Bill",
    "Transportation": "Trans",
    "Hangout w Friends": "Hangout",
    "GF": "GF",
    "Once in a while necessities": "Necess",
    "Travelling": "Travel",
    "Clothing": "Cloth",
    "Sports & Health": "Health",
    "Tool 4 Work": "Tools",
    "Learning": "Learn",
    "Investing": "Invest",
    "Family": "Family",
}

# Store all transactions in a dictionary of lists
transactions = {cat: [] for cat in CATEGORIES}


def display_menu():
    print("\nExpense Categories:")
    # Create two rows: one for numbers, one for categories
    numbers = [str(i) for i in range(1, len(CATEGORIES) + 1)]
    categories = [SHORT_NAMES[cat] for cat in CATEGORIES]
    print(
        tabulate(
            [numbers, categories],
            tablefmt="simple",
            colalign=("center",) * len(CATEGORIES),
        )
    )
    print(f"\n{len(CATEGORIES) + 1}. Done")


def write_transactions_to_csv(transactions):
    filename = "expenses.csv"
    fieldnames = CATEGORIES
    # Find the max number of transactions in any category
    max_len = max(len(lst) for lst in transactions.values())
    # Prepare rows: each row is a transaction index, each column is a category
    rows = []
    for i in range(max_len):
        row = {
            cat: transactions[cat][i] if i < len(transactions[cat]) else ""
            for cat in CATEGORIES
        }
        rows.append(row)
    with open(filename, "w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def print_subtotals(transactions):
    print("\nCurrent Subtotals:")
    headers = [SHORT_NAMES[cat] for cat in CATEGORIES]
    amounts = [f"${sum(transactions[cat]):.2f}" for cat in CATEGORIES]
    print(
        tabulate(
            [amounts],
            headers=headers,
            tablefmt="simple",
            colalign=("center",) * len(CATEGORIES),
        )
    )


def main():
    print("Welcome to Expense Tracker!")
    while True:
        display_menu()
        try:
            choice = int(input(f"\nEnter category number (1-{len(CATEGORIES)+1}): "))
            if choice < 1 or choice > len(CATEGORIES) + 1:
                print("Invalid choice. Please try again.")
                continue
            if choice == len(CATEGORIES) + 1:  # Done
                print("\nThank you for using Expense Tracker!")
                break
            category = CATEGORIES[choice - 1]
            amount = float(input(f"Enter amount for {category}: $"))
            transactions[category].append(amount)
            write_transactions_to_csv(transactions)
            print(f"\nAdded ${amount:.2f} to {category}")
            print_subtotals(transactions)
            print("\nAll transactions written to expenses.csv")
        except ValueError:
            print("Invalid input. Please enter a valid number.")
        except Exception as e:
            print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
