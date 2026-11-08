import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { CircleAlert, Inbox, Search } from "lucide-react";

import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { Switch } from "./switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

const statAccents = {
  primary: {
    topBar: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 ring-1 ring-blue-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(37,99,235,0.12)]",
  },
  info: {
    topBar: "bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500",
    icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 ring-1 ring-sky-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(2,132,199,0.12)]",
  },
  warning: {
    topBar: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ring-1 ring-amber-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)]",
  },
  critical: {
    topBar: "bg-gradient-to-r from-rose-600 via-red-600 to-pink-600",
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(239,68,68,0.12)]",
  },
  neutral: {
    topBar: "bg-gradient-to-r from-slate-400 via-slate-500 to-zinc-400",
    icon: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 ring-1 ring-slate-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(100,116,139,0.1)]",
  },
  success: {
    topBar: "bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 ring-1 ring-emerald-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)]",
  },
  gold: {
    topBar: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ring-1 ring-amber-500/10",
    glow: "hover:shadow-[0_8px_25px_rgba(245,158,11,0.12)]",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "primary",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: keyof typeof statAccents;
  className?: string;
}) {
  const style = statAccents[accent] ?? statAccents.primary;

  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden rounded-xl border-border/70 card-modern hover:border-border bg-card",
        style.glow,
        className,
      )}
    >
      <CardContent className="relative p-4">
        {/* Barra superior de acento com gradiente de alta tecnologia */}
        <div className={cn("absolute top-0 left-0 right-0 h-[3px]", style.topBar)} />
        <div className="flex items-start justify-between gap-3 pt-0.5">
          <p className="text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase truncate">
            {label}
          </p>
          {icon && (
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border [&_svg]:size-4 transition-transform duration-200 group-hover:scale-105",
                style.icon,
              )}
              aria-hidden
            >
              {icon}
            </span>
          )}
        </div>
        <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        {hint && (
          <p className="mt-1 text-xs text-muted-foreground font-medium truncate">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-border/70 shadow-xs", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border/60 bg-muted/20">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("p-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={wide ? "sm:max-w-4xl" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  numeric?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty,
  keyOf,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  empty?: string;
  keyOf: (row: T) => string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead
              key={column.header}
              className={cn(column.numeric && "text-right", column.className)}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {columns.map((column) => (
                <TableCell key={column.header}>
                  <Skeleton className="h-3.5 w-full max-w-[180px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!loading &&
          rows?.map((row) => (
            <TableRow key={keyOf(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.header}
                  className={cn(
                    column.numeric && "text-right font-mono tabular-nums",
                    column.className,
                  )}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!loading && rows && rows.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Inbox
                  className="size-6 text-muted-foreground/60"
                  aria-hidden
                />
                <span className="text-sm">
                  {empty ?? "Nenhum registro encontrado"}
                </span>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function Pagination({
  page,
  perPage,
  total,
  onPage,
}: {
  page: number;
  perPage: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
      <span>
        Página{" "}
        <span className="font-mono font-semibold text-foreground">{page}</span>{" "}
        de{" "}
        <span className="font-mono font-semibold text-foreground">{pages}</span>
        <span className="mx-1.5 text-muted-foreground/60">•</span>
        <span className="font-mono font-semibold text-foreground">
          {total}
        </span>{" "}
        registro(s)
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

export function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;

  let content = children;
  if (isValidElement(children)) {
    const element = children as ReactElement<{
      id?: string;
      "aria-invalid"?: boolean;
      "aria-describedby"?: string;
    }>;
    content = cloneElement(element, {
      id: element.props.id ?? generatedId,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? errorId : undefined,
    });
  }

  return (
    <div>
      <Label className="mb-1.5" htmlFor={generatedId}>
        {label}
      </Label>
      {content}
      {hint && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <CircleAlert />
      <AlertDescription className="text-destructive">
        {message}
      </AlertDescription>
    </Alert>
  );
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <form
      className="flex w-full max-w-md gap-2"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          className="pl-9"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <Button type="submit" variant="outline">
        Buscar
      </Button>
    </form>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="items-center gap-2 border-border/70 px-6 py-12 text-center card-modern">
      <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
        <Inbox className="size-5" aria-hidden />
      </span>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </Card>
  );
}

/** Barra de filtros e ações acima de tabelas e listagens. */
export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Valor técnico (placa, documento, data, métrica) sempre em fonte monoespaçada. */
export function MonoValue({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>{children}</span>
  );
}

/** Caixa de seleção com rótulo e descrição opcional, no padrão do design system. */
export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  description,
  disabled,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <div className="grid gap-0.5">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-foreground",
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

/** Interruptor booleano com rótulo, para preferências e situações de registro. */
export function SwitchField({
  label,
  checked,
  onCheckedChange,
  description,
  disabled,
  className,
}: {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="grid gap-0.5">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-foreground",
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
          )}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Diálogo de confirmação acessível, no lugar de `window.confirm`.
 * Envolve a aplicação e expõe a função `useConfirm`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setRequest({ options, resolve });
      }),
    [],
  );

  const settle = (value: boolean) => {
    const current = request;
    setRequest(null);
    current?.resolve(value);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={request !== null}
        onOpenChange={(open) => {
          if (!open) {
            settle(false);
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{request?.options.title}</DialogTitle>
            <DialogDescription>
              {request?.options.description ??
                "Confirme a ação para continuar."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => settle(false)}
            >
              {request?.options.cancelLabel ?? "Cancelar"}
            </Button>
            <Button
              type="button"
              variant={request?.options.destructive ? "destructive" : "default"}
              onClick={() => settle(true)}
            >
              {request?.options.confirmLabel ?? "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm deve ser usado dentro de ConfirmProvider");
  }

  return confirm;
}
