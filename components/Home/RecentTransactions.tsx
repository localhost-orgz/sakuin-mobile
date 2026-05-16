import { ChevronsRight } from "lucide-react-native";
import React from "react";
import { Text, View, Pressable } from "react-native";
import { Link } from "expo-router"; // Import Link untuk navigasi button bawah
import HomeSectionHeader from "./HomeSectionHeader";
import RecentTransactionItem from "./RecentTransactionItem";

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  wallet_id: string;
  category_id: {
    _id: string;
    name: string;
    slug: string;
    emoticon: string;
  };
}

type RecentTransactionsProps = {
  transactions: Transaction[];
};

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  return (
    <View className="">
      <View className="px-5">
        <HomeSectionHeader title="Latest Transactions" href={"/(others)/(transaction)/allTransactions"} />
      </View>

      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3.84,
          elevation: 2,
        }}
        className="flex flex-row bg-white py-2 mt-2 rounded-t-2xl border-b border-slate-300/30 justify-between items-center px-6"
      >
        <Text className="text-sm text-[#9ca3af]">Name</Text>
        <Text className="text-sm text-[#9ca3af]">Amount</Text>
      </View>

      {/* Render List Data dari API - Dibatasi maksimal 5 item terbaru */}
      <View className="flex-col bg-white">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((item) => {
            return <RecentTransactionItem key={item._id} item={item} />;
          })
        ) : (
          <View className="py-8 justify-center items-center">
            <Text className="text-sm text-[#9ca3af]">Belum ada transaksi</Text>
          </View>
        )}
      </View>
      
      {/* Button Other Transactions Terintegrasi Link href */}
      <Link href="/(others)/(transaction)/allTransactions" asChild>
        <Pressable
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 3.84,
            elevation: 1,
          }}
          className="flex flex-row bg-white py-2.5 rounded-b-2xl border-b border-slate-300/30 justify-center items-center px-6 gap-1 active:opacity-70"
        >
          <Text className="text-sm text-[#9ca3af]">Other Transactions</Text>
          <ChevronsRight color={"#9ca3af"} size={15} style={{ marginTop: 1 }} />
        </Pressable>
      </Link>
    </View>
  );
};

export default RecentTransactions;