import React from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
}

export function Pagination({
    currentPage,
    lastPage,
    perPage,
    total,
    onPageChange,
    onPerPageChange
}: PaginationProps) {
    const perPageOptions = [10, 25, 50, 100];

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * perPage + 1, total)} to{' '}
                    {Math.min(currentPage * perPage, total)} of {total} entries
                </p>
                <Select
                    value={perPage.toString()}
                    onValueChange={(value) => onPerPageChange(parseInt(value))}
                >
                    <SelectTrigger className="w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map((option) => (
                            <SelectItem key={option} value={option.toString()}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="icon"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        );
                    })}
                    {lastPage > 5 && (
                        <>
                            <span>...</span>
                            <Button
                                variant={currentPage === lastPage ? "default" : "outline"}
                                size="icon"
                                onClick={() => onPageChange(lastPage)}
                            >
                                {lastPage}
                            </Button>
                        </>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(lastPage)}
                    disabled={currentPage === lastPage}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
