"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, addDays, isValid, parse } from "date-fns";
import { ScanText } from "lucide-react";
import { ScanOverlay } from "@/components/scan-overlay";
import { parseMRZ } from "@/utils/mrzParser";



type FormValues = {
  name: string;
  surname: string;
  dob: Date;
  documentType: string;
  documentNumber: string;
  expiryDate: Date;
};

export default function DocumentForm() {

  const eighteenYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 18));

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      surname: "",
      // dob: new Date(),
      documentType: "",
      documentNumber: "",
      // expiryDate: new Date(),
    },
  });

  const [showScan, setShowScan] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>(""); // ✅ new state

  const handleScanClick = () => setShowScan(true);
  const handleCloseScan = () => setShowScan(false);

  // setopen for calender
  const [open, setOpen] = useState(false);
  const [openExpiry, setOpenExpiry] = useState(false);

  

  const handleCapture = (text?: string) => {
    if (text) {
      setOcrResult(text); // still store raw OCR for display

      try {
        const parsed = parseMRZ(text);
        console.log("Parsed MRZ data:", parsed);
        

        // Pre-fill form
        form.setValue("name", parsed.givenNames);
        form.setValue("surname", parsed.surname);
        if (parsed.dateOfBirth) {
          const dob = parse(parsed.dateOfBirth, "dd/MM/yyyy", new Date());
          if (isValid(dob)) {
            form.setValue("dob", dob);
          }
        }
        form.setValue("documentType", parsed.documentType === "P" ? "passport" : "id_card"); // simple mapping
        form.setValue("documentNumber", parsed.documentNumber);
        if (parsed.dateOfExpiry) {
          const expiry = parse(parsed.dateOfExpiry, "dd/MM/yyyy", new Date());
          if (isValid(expiry)) {
            form.setValue("expiryDate", expiry);
          }
        }
      } catch (err) {
        console.error("MRZ parsing failed:", err);
      }
    }

    setShowScan(false);
  };


  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <div className="max-w-lg mx-auto p-8 border rounded-md shadow-md">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Document Form</h1>
          <Button
            variant="outline"  // keeps the border style like your previous button
            size="icon"         // makes it square and fits the icon
            onClick={handleScanClick}
          >
            <ScanText className="w-6 h-6" /> {/* adjust size if needed */}
          </Button>

        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surname</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your surname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger>
                    <FormControl>
                      <Input
                        readOnly
                        value={field.value ? format(field.value, "dd/MM/yyyy") : ""}
                        placeholder="Select date of birth"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      defaultMonth={field.value || eighteenYearsAgo}                
                      selected={field.value || eighteenYearsAgo}
                      captionLayout="dropdown"
                      disabled={(currentDate) => currentDate > eighteenYearsAgo}
                      toYear={eighteenYearsAgo.getFullYear()} // latest year allowed
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpen(false); // close popover on date select
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="id_card">ID Card</SelectItem>
                      <SelectItem value="driver_license">Driver License</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter document number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <Popover open={openExpiry} onOpenChange={setOpenExpiry}>
                  <PopoverTrigger>
                    <FormControl>
                      <Input
                        readOnly
                        value={field.value ? format(field.value, "dd/MM/yyyy") : ""}
                        placeholder="Select expiry date"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value || new Date()}
                      captionLayout="dropdown"
                      defaultMonth={field.value }
                      disabled={(date) => addDays(date, 1) < new Date()}
                      fromYear={new Date().getFullYear()}
                      toYear={2100}
                      // onSelect={field.onChange}
                      onSelect={(date) => {
                        field.onChange(date);
                        setOpenExpiry(false); // close popover on date select
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              Submit
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                form.reset(); // 🔑 This clears all fields back to defaultValues
                setOcrResult(""); // also clear OCR result box
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
      {showScan && <ScanOverlay onClose={handleCloseScan} onCapture={handleCapture} />}
      {ocrResult && (
        <div className="max-w-lg mx-auto p-4 mt-4 border rounded-md shadow-md bg-gray-50">
          <h3 className="font-semibold mb-2">OCR Result:</h3>
          <p className="whitespace-pre-wrap">{ocrResult}</p>
        </div>
      )}
    </Form>

  );
}
