"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  UpdateFormData,
  InsertFormData,
  updateSchema,
  insertSchema,
} from "@/types/navigation";

interface NavigationFormProps {
  onSubmit: (data: UpdateFormData | InsertFormData) => void;
  onCancel: () => void;
  initialData?: UpdateFormData;
  mode: "update" | "insert";
}

export function NavigationForm({
  onSubmit,
  onCancel,
  initialData,
  mode,
}: NavigationFormProps) {
  const form = useForm({
    resolver: zodResolver(mode === "update" ? updateSchema : insertSchema),
    defaultValues: initialData || {
      label: "",
      url: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
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
          <Button type="submit">
            {mode === "update" ? "Zapisz" : "Dodaj"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
