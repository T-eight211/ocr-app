"use client";
import React from "react";
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
import { format } from "date-fns";
import { ScanText } from "lucide-react";


type FormValues = {
  name: string;
  surname: string;
  dob: Date;
  documentType: string;
  documentNumber: string;
  expiryDate: Date;
};

export default function DocumentForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      surname: "",
      dob: new Date(),
      documentType: "",
      documentNumber: "",
      expiryDate: new Date(),
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <div className="max-w-lg mx-auto p-8 border rounded-md shadow-md m-8 ">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Document Form</h1>
          <button
            type="button"
            className="w-12 h-12 rounded-full border border-black flex items-center justify-center hover:bg-black hover:text-white transition"
          >
            <ScanText size={24} />
          </button>
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
                <Popover>
                  <PopoverTrigger>
                    <FormControl>
                      <Input
                        readOnly
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        placeholder="Select date of birth"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
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
                <Popover>
                  <PopoverTrigger>
                    <FormControl>
                      <Input
                        readOnly
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        placeholder="Select expiry date"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </div>
    </Form>

  );
}
