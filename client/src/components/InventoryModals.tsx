import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const useItemSchema = z.object({
  quantity: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity must be at least 1",
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

const restockSchema = z.object({
  quantity: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantity must be at least 1",
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

type UseItemInput = z.input<typeof useItemSchema>;
type UseItemData = z.output<typeof useItemSchema>;
type RestockInput = z.input<typeof restockSchema>;
type RestockData = z.output<typeof restockSchema>;

interface UseItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemName: string;
  currentQuantity: number;
}

export function UseItemModal({ open, onOpenChange, itemId, itemName, currentQuantity }: UseItemModalProps) {
  const { toast } = useToast();
  
  const form = useForm<UseItemInput>({
    resolver: zodResolver(useItemSchema) as any,
    defaultValues: {
      quantity: "1",
    },
  });

  const useItemMutation = useMutation({
    mutationFn: (data: UseItemData) => inventoryApi.use(itemId, null, data.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: `Used ${form.getValues('quantity')} units of ${itemName}`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to use item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UseItemData) => {
    if (data.quantity > currentQuantity) {
      toast({
        title: "Error",
        description: "Cannot use more than available quantity",
        variant: "destructive",
      });
      return;
    }
    useItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use {itemName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Use</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={currentQuantity}
                      {...field}
                      data-testid="input-use-quantity"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Available: {currentQuantity} units
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-use"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={useItemMutation.isPending}
                data-testid="button-confirm-use"
              >
                {useItemMutation.isPending ? "Using..." : "Use Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface RestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: number;
  itemName: string;
}

export function RestockModal({ open, onOpenChange, itemId, itemName }: RestockModalProps) {
  const { toast } = useToast();
  
  const form = useForm<RestockInput>({
    resolver: zodResolver(restockSchema) as any,
    defaultValues: {
      quantity: "1",
    },
  });

  const restockMutation = useMutation({
    mutationFn: (data: RestockData) => inventoryApi.restock(itemId, data.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: `Restocked ${form.getValues('quantity')} units of ${itemName}`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restock item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RestockData) => {
    restockMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock {itemName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Add</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      data-testid="input-restock-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-restock"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={restockMutation.isPending}
                data-testid="button-confirm-restock"
              >
                {restockMutation.isPending ? "Restocking..." : "Restock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
