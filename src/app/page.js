"use client"
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image";
import stressedImage from '../../public/stressed.jpg'
import { Calendar } from "@/components/ui/calendar"
import {useEffect, useState} from "react";
import {isSameDay} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [dueDates, setDueDates] = useState([]);
  const [scheduledBills, setScheduledBills] = useState([]);
  const [currentBills, setCurrentBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [noBills, setNoBills] = useState(false);
  const [newScheduledBillValue, setNewScheduledBillValue] = useState(
      {name: "", amount: "", dayDue: ""}
  );
  const localstorageBillsKey = "scheduled-bills";
  const localstoragePaidBillsKey = "paid-bills";


  // Load from local storage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScheduledBills = localStorage.getItem(localstorageBillsKey);
      const storedPaidBills = localStorage.getItem(localstoragePaidBillsKey);

      let parsedSchedule = [];
      let parsedPaidBills = [];

      if (storedScheduledBills) {
        parsedSchedule = JSON.parse(storedScheduledBills)
        setScheduledBills(parsedSchedule);
      }

      if (storedPaidBills) {
        parsedPaidBills = JSON.parse(storedPaidBills)
        setPaidBills(parsedPaidBills);
      }

        if (parsedSchedule.length > 0) {
          const currentBills = parsedSchedule.map(schBill => {
            const currentMappedBill = {
              id: uuidv4(),
              schBillId: schBill.id,
              name: schBill.name,
              amount: schBill.amount,
              dueDate: createDateFromDay(schBill.dayDue),
              paid: false
            }

            // Check if the bill has been paid
            if (parsedPaidBills.length > 0) {
              if(parsedPaidBills.find(paidBill => paidBill.schBillId === schBill.id && isSameDay(new Date(paidBill.dueDate), currentMappedBill.dueDate))) {
                currentMappedBill.paid = true;
              }
            }

            return currentMappedBill;
          });

          setCurrentBills(currentBills);
          setDueDates(currentBills.map((bill) => new Date(bill.dueDate)));
        } else {

          setNoBills(true);
        }
    }
  }, [refreshCount]);

  // const handleDayClick = (day, modifiers) => {
  //   const newSelectedDays = [...days];
  //   if (modifiers.selected) {
  //     const index = selectedDays.findIndex((selectedDay) =>
  //         isSameDay(day, selectedDay)
  //     );
  //     newSelectedDays.splice(index, 1);
  //   } else {
  //     newSelectedDays.push(day);
  //   }
  //   setDays(newSelectedDays);
  // };

  const saveNewBill = () => {
    if (newScheduledBillValue.name === "" || newScheduledBillValue.amount === "" || newScheduledBillValue.dayDue === "") {
      return;
    }
    const dueDate = createDateFromDay(newScheduledBillValue.dayDue);
    const newScheduledBill = {
      id: uuidv4(),
      name: newScheduledBillValue.name,
      amount: newScheduledBillValue.amount,
      dayDue: newScheduledBillValue.dayDue
    };
    const newCurrentBill = {
      id: uuidv4(),
      schBillId: newScheduledBill.id,
      name: newScheduledBillValue.name,
      amount: newScheduledBillValue.amount,
      dueDate: dueDate,
      paid: false
    };
    const updatedScheduledBills = [...scheduledBills, newScheduledBill];
    const updatedCurrentBills = [...currentBills, newCurrentBill];
    setScheduledBills(updatedScheduledBills);
    setCurrentBills(updatedCurrentBills);
    if (typeof window !== "undefined") {
      localStorage.setItem(localstorageBillsKey, JSON.stringify(updatedScheduledBills));
    }
    setRefreshCount(refreshCount + 1);
  };

  const markBillPaid = (newPaidBill) => {
    newPaidBill.paid = true;
    const updatedPaidBills = [...paidBills, newPaidBill];
    setPaidBills(updatedPaidBills);
    if (typeof window !== "undefined") {
      localStorage.setItem(localstoragePaidBillsKey, JSON.stringify(updatedPaidBills));
    }
    setRefreshCount(refreshCount + 1);
  };

  const handleAddBillInputChange = (e) => {
    const { name, value } = e.target;
    setNewScheduledBillValue(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex-col z-10 max-w-5xl w-full font-mono text-sm lg:flex">
          <div className="flex flex-row items-center justify-center pb-5">
            <p className="text-4xl font-thin">Pay The Bill</p>
            <Image
                className="rounded-full"
                src={stressedImage}
                alt="Picture of the author"
                width={150}
                height={150}
                placeholder="blur"
            />
          </div>
          <div className="flex flex-row w-full gap-x-32 justify-center">
            <div className="flex flex-col">
              <div className="flex flex-row w-full justify-center p-4">
                <p>Due Date Calendar</p>
              </div>
              <Calendar
                  className="rounded-md border w-72 animate-fade-in-once"
                  inputProps={{ readOnly: true, disabled: true }}
                  selected={dueDates}
              />
            </div>
            <div className="flex flex-col gap-y-3 h-96 overflow-y-scroll">
              <div className="flex flex-row w-full justify-between items-center pb-2 pr-5">
              <p>Bills for the Month</p>
              <AddBillButton inputHandler={handleAddBillInputChange} submitHandler={saveNewBill} />
              </div>
              {noBills ? <NoBillsCard/> :
                currentBills.length > 0 ? currentBills.map((bill) => (
                <BillCard
                    key={bill.id}
                    bill={bill}
                    payHandler={() => markBillPaid(bill)}
                />
              )) :   <LoadingSpinner/>
              }
            </div>
          </div>
      </div>
    </main>
  );
}

function BillCard({bill, payHandler}) {
  return (
    <Card className="min-w-96 animate-fade-in-once mr-5">
      <CardTitle>
      {bill.name}
      </CardTitle>
      <CardContent>
        <div className="flex flex-row justify-between">
        </div>
        <span className="font-bold">Amount:</span> ${bill.amount} {bill.paid ? <span className="font-bold text-lime-500">Paid</span>
          : <Button onClick={payHandler} variant="outline">Pay</Button>}
      </CardContent>
      <CardFooter>
        <span className="font-bold">Due On: </span> {formatDate(new Date(bill.dueDate))}
      </CardFooter>
    </Card>
  );
}

function NoBillsCard() {
  return (
      <Card className="min-w-96 animate-fade-in-once mr-5">
        <CardTitle>
          No Bills Due
        </CardTitle>
        <CardContent>
          Lucky you! No bills are due this month.
        </CardContent>
      </Card>
  );
}

function LoadingSpinner() {
  return (
      <div className="min-w-96 min-h-64 justify-self-auto">
        <svg aria-hidden="true"
             className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
             viewBox="0 0 100 101" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"/>
          <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"/>
        </svg>
      </div>);
}

function AddBillButton({inputHandler, submitHandler}) {
  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">+</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
            <DialogDescription>
              I feel bad for you dawg...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input onChange={inputHandler} placeholder="Name" name="name"/>
              <Input onChange={inputHandler} placeholder="Amount" name="amount"/>
              <Input onChange={inputHandler} placeholder="Day Due" name="dayDue"/>
              <DialogTrigger asChild>
                <Button onClick={submitHandler} variant="secondary" type="submit" size="sm" className="px-3 w-1/3">
                  Add
                </Button>
              </DialogTrigger>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  )
}

// helper functions
function formatDate(date) {
  console.log(date)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function createDateFromDay(day) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return new Date(year, month, day);
}

