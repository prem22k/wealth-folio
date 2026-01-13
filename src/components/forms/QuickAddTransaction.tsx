'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Button removed as it was unused 
// Actually, looking at the prompt "Use React-hook-form with zod", user didn't explicitly say use shadcn/ui but implied "create a clean, dark-themed card using Tailwind classes".
// I will use standard HTML elements with Tailwind classes to be safe and self-contained, or minimal dependencies.
// But wait, the user has "lucide-react".
// Let's stick to standard HTML + Tailwind for inputs/selects to avoid dependency on unverified UI components, 
// unless I see them in the file list. I don't see a `components/ui` listing in the context, but I can assume standard things might exist. 
// However, to be robust, I will build the UI elements with Tailwind directly as requested.

import { Calendar, IndianRupee } from 'lucide-react';
import { toPaise } from '@/types/schema';

// Schema Definition
const transactionSchema = z.object({
    amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
    description: z.string().min(1, { message: 'Description is required' }),
    category: z.string().min(1, { message: 'Category is required' }),
    source: z.string().min(1, { message: 'Source is required' }),
    date: z.coerce.date().max(new Date(), { message: 'Date cannot be in the future' }),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function QuickAddTransaction() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TransactionFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(transactionSchema) as any,
        defaultValues: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            date: new Date().toISOString().split('T')[0] as any,
            category: '',
            source: '',
        },
    });

    const onSubmit = (data: TransactionFormValues) => {
        const formattedData = {
            ...data,
            amount: toPaise(data.amount),
        };
        console.log('Form Submitted:', formattedData);
        reset();
    };

    return (
        <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Quick Add</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Amount Field */}
                <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium text-slate-400">
                        Amount
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IndianRupee className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            {...register('amount')}
                        />
                    </div>
                    {errors.amount && (
                        <p className="text-xs text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-slate-400">
                        Description
                    </label>
                    <input
                        id="description"
                        type="text"
                        placeholder="What did you spend on?"
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        {...register('description')}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500">{errors.description.message}</p>
                    )}
                </div>

                {/* Category & Source Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium text-slate-400">
                            Category
                        </label>
                        <select
                            id="category"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                            {...register('category')}
                        >
                            <option value="" disabled>Select</option>
                            <option value="Food">Food</option>
                            <option value="Travel">Travel</option>
                            <option value="Bills">Bills</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.category && (
                            <p className="text-xs text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Source */}
                    <div className="space-y-2">
                        <label htmlFor="source" className="text-sm font-medium text-slate-400">
                            Source
                        </label>
                        <select
                            id="source"
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                            {...register('source')}
                        >
                            <option value="" disabled>Select</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                        {errors.source && (
                            <p className="text-xs text-red-500">{errors.source.message}</p>
                        )}
                    </div>
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium text-slate-400">
                        Date
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            id="date"
                            type="date"
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:invert"
                            {...register('date')}
                        />
                    </div>
                    {errors.date && (
                        <p className="text-xs text-red-500">{errors.date.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Add Transaction
                </button>
            </form>
        </div>
    );
}
