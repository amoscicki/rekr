"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NavigationFormData } from "@/types/navigation";

const formSchema = z.object({
  label: z.string().min(1, "Nazwa jest wymagana"),
  url: z.string().url().optional().or(z.literal("")),
});

interface NavigationFormProps {
  onSubmit: (data: NavigationFormData) => void;
  onCancel: () => void;
  initialData?: NavigationFormData;
}

export function NavigationForm({
  onSubmit,
  onCancel,
  initialData,
}: NavigationFormProps) {
  const form = useForm<NavigationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      url: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa</FormLabel>
              <FormControl>
                <Input placeholder="np. Promocje" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input placeholder="Wklej lub wyszukaj" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit">Dodaj</Button>
        </div>
      </form>
    </Form>
  );
}
