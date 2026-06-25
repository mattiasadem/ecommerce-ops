import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { badgeColor } from "@/lib/utils";

interface ResearchTableProps {
  rows: Array<Record<string, string>>;
  sourceColumn?: string;
  highlightColumns?: string[];
}

export function ResearchTable({ rows, sourceColumn, highlightColumns = [] }: ResearchTableProps) {
  if (!rows.length) return null;
  const headers = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  // Detect "Source" column to render as a badge.
  const sourceKey = sourceColumn ?? headers.find((h) => /source/i.test(h));

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              {headers.map((h) => {
                const cell = r[h] ?? "";
                if (h === sourceKey) {
                  // Extract confidence tag in [brackets].
                  const m = /\[(verified|directional|rule-of-thumb)\]/i.exec(cell);
                  const tag = m?.[1] ?? cell;
                  return (
                    <TableCell key={h} className="text-xs">
                      <Badge variant="outline" className={badgeColor(tag)}>
                        {tag}
                      </Badge>
                    </TableCell>
                  );
                }
                if (highlightColumns.includes(h)) {
                  return (
                    <TableCell key={h} className="font-mono tabular-nums text-xs">
                      {cell}
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={h} className="text-xs leading-snug">
                    {cell}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}