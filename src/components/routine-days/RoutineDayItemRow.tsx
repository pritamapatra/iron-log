import {
  GripVertical,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "@/components/Badge";

interface RoutineDayItem {
  id: string;
  order: number;
  exercise: {
    id: string;
    name: string;
    type: "STRENGTH" | "CARDIO";
    muscleGroup: string;
  };
}

interface RoutineDayItemRowProps {
  item: RoutineDayItem;
  onDelete: (itemId: string) => void;
}

export function RoutineDayItemRow({
  item,
  onDelete,
}: RoutineDayItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overflow-hidden rounded-[16px] border border-black/[0.04] bg-surface shadow-level-1"
    >
      <div className="flex min-h-[76px] items-center justify-between gap-[12px] px-[16px] py-[16px]">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-[4px] text-left">
          <div className="flex min-w-0 items-center gap-[8px]">
            <span className="truncate text-headline-sm font-semibold text-text-primary">
              {item.exercise.name}
            </span>
            <Badge type={item.exercise.type === "STRENGTH" ? "strength" : "cardio"}>
              {item.exercise.type === "STRENGTH" ? "Strength" : "Cardio"}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[4px]">
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.exercise.name}`}
            className="flex h-[36px] w-[36px] items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-error-container/30 hover:text-tag-cardio"
          >
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            aria-label="Drag to reorder"
            className="flex h-[44px] w-[44px] cursor-grab touch-none items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-container-low active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
