import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DateRangeSelectorProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  comparisonType: "compare" | "until";
  onComparisonTypeChange: (type: "compare" | "until") => void;
}

const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  comparisonType,
  onComparisonTypeChange,
}: DateRangeSelectorProps) => {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[180px] justify-between date-picker border-synergy-blue/20 hover:border-synergy-blue/50",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? (
                format(startDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                "Selecione a data"
              )}
              <CalendarIcon className="ml-2 h-4 w-4 text-synergy-blue" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                onStartDateChange(date);
                setIsStartOpen(false);
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <RadioGroup
          value={comparisonType}
          onValueChange={(value) => onComparisonTypeChange(value as "compare" | "until")}
          className="flex items-center space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="compare" id="compare" />
            <Label htmlFor="compare" className="text-xs font-medium">COMPARAR</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="until" id="until" />
            <Label htmlFor="until" className="text-xs font-medium">ATÉ</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[180px] justify-between date-picker border-synergy-blue/20 hover:border-synergy-blue/50",
                !endDate && "text-muted-foreground"
              )}
            >
              {endDate ? (
                format(endDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                "Selecione a data"
              )}
              <CalendarIcon className="ml-2 h-4 w-4 text-synergy-blue" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                onEndDateChange(date);
                setIsEndOpen(false);
              }}
              initialFocus
              locale={ptBR}
              disabled={(date) => {
                if (!startDate) return false;
                // Disable dates before start date
                return date < startDate;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeSelector;