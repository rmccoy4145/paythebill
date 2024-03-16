"use client"
import Image from "next/image";
import stressedImage from '../../public/stressed.jpg'
import { Calendar } from "@/components/ui/calendar"
import {useState} from "react";
import {isSameDay} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {

  const scheduled_bills = [
    {id: "12343252", name: "Rent", amount: 1000, due_date: new Date(2024, 2, 1)},
    {id: "12343252", name: "Loan", amount: 1000, due_date: new Date(2024, 2, 4)},
    {id: "12343252", name: "CreditCard", amount: 1000, due_date: new Date(2024, 2, 15)},
  ];

  const initialDays = scheduled_bills.map((bill) => bill.due_date);

  const [days, setDays] = useState(initialDays);
  const handleDayClick = (day, modifiers) => {
    const newSelectedDays = [...days];
    if (modifiers.selected) {
      const index = selectedDays.findIndex((selectedDay) =>
          isSameDay(day, selectedDay)
      );
      newSelectedDays.splice(index, 1);
    } else {
      newSelectedDays.push(day);
    }
    setDays(newSelectedDays);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex-col z-10 max-w-5xl w-full font-mono text-sm lg:flex">
          <div className="flex flex-row items-center pb-5">
            <p className="text-4xl font-thin">Pay The Bill</p>
            <Image
                className="rounded-full"
                src={stressedImage}
                alt="Picture of the author"
                width={150}
                height={150}
                // blurDataURL="data:..." automatically provided
                // placeholder="blur" // Optional blur-up while loading
            />
          </div>
          <div className="flex flex-row w-full">
            <div className="flex flex-col w-full">
              <Calendar
                  inputProps={{ readOnly: true, disabled: true }}
                  onDayClick={handleDayClick}
                  mode="multiple"
                  selected={days}
              />
            </div>

            <div className="flex flex-col w-full">
              <p>This Month's Bills</p>
              {scheduled_bills.map((bill) => (
                <BillCard
                    key={bill.id}
                    name={bill.name}
                    amount={bill.amount}
                    due_date={bill.due_date.toDateString()}
                />
              ))}
            </div>
          </div>
      </div>
    </main>
  );
}

function BillCard({name, amount, due_date}) {
  return (
    <Card>
      <CardTitle>
      {name}
      </CardTitle>
      <CardContent>
        Amount: ${amount} Due: {due_date}
      </CardContent>
    </Card>
  );
}
