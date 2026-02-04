
import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, Wand2, Quote, BookOpen, Scaling } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type ImprovementType = 'general' | 'add_example' | 'simplify' | 'expand';

interface RegenerateButtonProps {
    onRegenerate: (type: ImprovementType) => Promise<void>;
    isRegenerating?: boolean;
    className?: string;
}

export function RegenerateButton({ onRegenerate, isRegenerating, className }: RegenerateButtonProps) {
    const handleSelect = async (type: ImprovementType) => {
        if (isRegenerating) return;
        await onRegenerate(type);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRegenerating}
                    className={cn(
                        "h-8 gap-1 px-2 font-bold hover:bg-primary/10 hover:text-primary transition-all group",
                        isRegenerating && "cursor-not-allowed opacity-50",
                        className
                    )}
                >
                    {isRegenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs">✨ Regenerate</span>
                    <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-2 shadow-xl">
                <DropdownMenuItem
                    onClick={() => handleSelect('general')}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="bg-purple-100 p-2 rounded-md">
                        <Wand2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Mejorar redacción</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Optimiza claridad y fluidez</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleSelect('add_example')}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="bg-blue-100 p-2 rounded-md">
                        <Quote className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Añadir ejemplo</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Agrega casos prácticos</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleSelect('simplify')}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="bg-green-100 p-2 rounded-md">
                        <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Simplificar lenguaje</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Hazlo más accesible</span>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleSelect('expand')}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="bg-orange-100 p-2 rounded-md">
                        <Scaling className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Expandir contenido</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">Más detalles y profundidad</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
