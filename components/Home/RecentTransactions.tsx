import { ChevronsRight } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import HomeSectionHeader from "./HomeSectionHeader";
import RecentTransactionItem from "./RecentTransactionItem";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  date: string;
  wallet: string;
  categoryId: string;
};

type RecentTransactionsProps = {
  transactions: Transaction[];
};

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <View className="">
      <View className="px-5">
        <HomeSectionHeader title="Latest Transactions" href={"/analytics"} />
      </View>

      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.5,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        className="flex flex-row bg-white py-3 mt-2 rounded-t-2xl border-b border-slate-300/30 justify-between items-center px-6"
      >
        <Text className="text-md text-[#9ca3af]">Name</Text>
        <Text className="text-md text-[#9ca3af]">Amount</Text>
      </View>

      {/* list */}
      <View className="flex-1 flex-col gap-0 bg-white">
        {transactions.map((item) => {
          return <RecentTransactionItem key={item.id} item={item} />;
        })}
      </View>
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        className="flex flex-row bg-white py-3 rounded-b-2xl border-b border-slate-300/30 justify-center items-center px-6 gap-3"
      >
        <Text className="text-md text-[#9ca3af]">Other Transactions</Text>
        <ChevronsRight color={"#9ca3af"} size={18} />
      </View>
    </View>
  );
};

export default RecentTransactions;
