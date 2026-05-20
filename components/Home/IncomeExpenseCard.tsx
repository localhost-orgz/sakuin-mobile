import { TrendingUp, TrendingDown } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";

const IncomeExpenseCard = ({
  isBalanceShow,
  transactions = [],
  user = null,
  loading,
}: {
  isBalanceShow: boolean;
  transactions?: any[];
  user?: any;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-5">
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
          className="w-[170px] bg-white rounded-lg p-3 gap-2"
        >
          <Skeleton width={50} height={10} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          <View className="mt-1 gap-2">
            <Skeleton width={110} height={22} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
            <Skeleton width={80} height={12} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          </View>
        </View>
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
          className="w-[170px] bg-white rounded-lg p-3 gap-2"
        >
          <Skeleton width={50} height={10} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          <View className="mt-1 gap-2">
            <Skeleton width={110} height={22} borderRadius={4} style={{ backgroundColor: "#cbd5e1" }} />
            <Skeleton width={80} height={12} borderRadius={3} style={{ backgroundColor: "#cbd5e1" }} />
          </View>
        </View>
      </View>
    );
  }

  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  let lastMonthIncome = 0;
  let lastMonthExpense = 0;

  const summary = user?.financialsummary || user?.financialSummary;
  if (summary && typeof summary === "object") {
    // Shape 1: { income: 15000000, expense: 5000000, lastIncome: 10000000, lastExpense: 4000000 }
    if ("income" in summary && "lastIncome" in summary) {
      currentMonthIncome = Number(summary.income) || 0;
      lastMonthIncome = Number(summary.lastIncome) || 0;
    }
    if ("expense" in summary && "lastExpense" in summary) {
      currentMonthExpense = Number(summary.expense) || 0;
      lastMonthExpense = Number(summary.lastExpense) || 0;
    }

    // Shape 2: { thisMonthIncome: X, lastMonthIncome: Y, thisMonthExpense: A, lastMonthExpense: B }
    if ("thisMonthIncome" in summary) currentMonthIncome = Number(summary.thisMonthIncome) || 0;
    if ("lastMonthIncome" in summary) lastMonthIncome = Number(summary.lastMonthIncome) || 0;
    if ("thisMonthExpense" in summary) currentMonthExpense = Number(summary.thisMonthExpense) || 0;
    if ("lastMonthExpense" in summary) lastMonthExpense = Number(summary.lastMonthExpense) || 0;

    // Shape 3: { thisMonth: { income: X, expense: Y }, lastMonth: { income: Z, expense: W } }
    if (summary.thisMonth && typeof summary.thisMonth === "object") {
      currentMonthIncome = Number(summary.thisMonth.income) || 0;
      currentMonthExpense = Number(summary.thisMonth.expense) || 0;
    }
    if (summary.lastMonth && typeof summary.lastMonth === "object") {
      lastMonthIncome = Number(summary.lastMonth.income) || 0;
      lastMonthExpense = Number(summary.lastMonth.expense) || 0;
    }

    // Shape 4: { income: { current_month: X, last_month: Y }, expense: { current_month: A, last_month: B } }
    if (summary.income && typeof summary.income === "object") {
      currentMonthIncome = Number(summary.income.current_month || summary.income.thisMonth || summary.income.current) || 0;
      lastMonthIncome = Number(summary.income.last_month || summary.income.lastMonth || summary.income.last) || 0;
    }
    if (summary.expense && typeof summary.expense === "object") {
      currentMonthExpense = Number(summary.expense.current_month || summary.expense.thisMonth || summary.expense.current) || 0;
      lastMonthExpense = Number(summary.expense.last_month || summary.expense.lastMonth || summary.expense.last) || 0;
    }
  }

  // If no summary was extracted or if the values are 0, compute from transactions dynamically!
  if (
    currentMonthIncome === 0 &&
    currentMonthExpense === 0 &&
    lastMonthIncome === 0 &&
    lastMonthExpense === 0 &&
    transactions &&
    transactions.length > 0
  ) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth();

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date);
      const amount = Number(tx.amount) || 0;

      if (txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth) {
        if (tx.type === "income") {
          currentMonthIncome += amount;
        } else if (tx.type === "expense") {
          currentMonthExpense += amount;
        }
      } else if (txDate.getFullYear() === lastYear && txDate.getMonth() === lastMonth) {
        if (tx.type === "income") {
          lastMonthIncome += amount;
        } else if (tx.type === "expense") {
          lastMonthExpense += amount;
        }
      }
    });
  }

  // Income calculations
  let incomePercent = 0;
  if (lastMonthIncome > 0) {
    incomePercent = Math.round(((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100);
  } else if (currentMonthIncome > 0) {
    incomePercent = 100;
  }
  const isIncomeUp = incomePercent >= 0;
  const IncomeIcon = isIncomeUp ? TrendingUp : TrendingDown;
  const incomeColor = isIncomeUp ? "#00BC7D" : "#EF4444";

  // Expense calculations
  let expensePercent = 0;
  if (lastMonthExpense > 0) {
    expensePercent = Math.round(((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100);
  } else if (currentMonthExpense > 0) {
    expensePercent = 100;
  }
  const isExpenseUp = expensePercent >= 0;
  const ExpenseIcon = isExpenseUp ? TrendingUp : TrendingDown;
  const expenseColor = isExpenseUp ? "#EF4444" : "#00BC7D";

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val);
  };

  return (
    <View className="w-full -bottom-7 flex flex-row items-center justify-center gap-5">
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 3,
        }}
        className="w-[170px] bg-white rounded-lg p-3"
      >
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Income
        </Text>
        <View className="mt-2">
          <View className="flex flex-row items-center">
            <Text className="font-semibold">Rp</Text>
            <Text className="text-xl font-semibold ml-0.5">
              {isBalanceShow ? formatRupiah(currentMonthIncome) : "•••••••"}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1 mt-1">
            <IncomeIcon size={13} color={incomeColor} />
            <Text style={{ color: incomeColor, fontSize: 11 }} className="font-medium">
              {`${isIncomeUp ? "+" : ""}${incomePercent}% from last month`}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 3,
        }}
        className="w-[170px] bg-white rounded-lg p-3"
      >
        <Text
          style={{
            fontSize: 10,
            color: "#9ca3af",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Expense
        </Text>
        <View className="mt-2">
          <View className="flex flex-row items-center">
            <Text className="font-semibold">Rp</Text>
            <Text className="text-xl font-semibold ml-0.5">
              {isBalanceShow ? formatRupiah(currentMonthExpense) : "•••••••"}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1 mt-1">
            <ExpenseIcon size={13} color={expenseColor} />
            <Text style={{ color: expenseColor, fontSize: 11 }} className="font-medium">
              {`${isExpenseUp ? "+" : ""}${expensePercent}% from last month`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IncomeExpenseCard;
