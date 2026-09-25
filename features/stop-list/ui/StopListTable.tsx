"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatStock, formatUntil } from "@/shared/lib/format";
import type { MenuItem } from "@/types/menu";
import { SHOP_TITLE, STOP_REASON_LABELS } from "../model/labels";
import type { LoadStatus } from "../model/menu-slice";

interface StopListTableProps {
	items: MenuItem[];
	status: LoadStatus;
	error: string | null;
	pendingIds: string[];
	onOpenPanel: (item: MenuItem) => void;
	onResume: (item: MenuItem) => void;
	onRetry: () => void;
}

export function StopListTable({
	items,
	status,
	error,
	pendingIds,
	onOpenPanel,
	onResume,
	onRetry,
}: StopListTableProps) {
	if (status === "loading") return <TableSkeleton />;

	if (status === "failed") {
		return (
			<div className="flex flex-col items-start gap-3 rounded-2xl border border-accent/40 bg-accent/[0.06] p-6">
				<p className="text-sm font-medium text-ink">
					Не удалось загрузить меню смены
				</p>
				<p className="text-sm text-muted">{error}</p>
				<Button variant="secondary" onClick={onRetry}>
					Повторить
				</Button>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
				<p className="text-sm font-medium text-ink">Ничего не найдено</p>
				<p className="text-sm text-muted">
					Попробуйте изменить фильтры по цеху или статусу.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-line bg-black/2 text-left text-xs uppercase tracking-wide text-muted">
						<th scope="col" className="px-5 py-3 font-medium">
							Позиция
						</th>
						<th scope="col" className="px-5 py-3 font-medium">
							Цех
						</th>
						<th scope="col" className="px-5 py-3 font-medium">
							Остаток
						</th>
						<th scope="col" className="px-5 py-3 font-medium">
							Статус
						</th>
						<th scope="col" className="px-5 py-3 text-right font-medium">
							Действия
						</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<StopListRow
							key={item.id}
							item={item}
							isPending={pendingIds.includes(item.id)}
							onOpenPanel={onOpenPanel}
							onResume={onResume}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

interface StopListRowProps {
	item: MenuItem;
	isPending: boolean;
	onOpenPanel: (item: MenuItem) => void;
	onResume: (item: MenuItem) => void;
}

function StopListRow({
	item,
	isPending,
	onOpenPanel,
	onResume,
}: StopListRowProps) {
	const isStopped = item.status.kind === "stopped";
	const canResume = isStopped && item.stock > 0;
	const resumeHint =
		item.stock > 0 ? undefined : "Нельзя вернуть в продажу: остаток 0";

	return (
		<tr
			className={`border-b border-line/70 transition-colors last:border-b-0 ${
				isStopped ? "bg-black/2.5 text-muted" : "hover:bg-black/1.5"
			}`}
		>
			<td className="px-5 py-4">
				<div className="flex flex-col gap-1">
					<span
						className={`font-medium ${isStopped ? "text-muted" : "text-ink"}`}
					>
						{item.title}
					</span>
					{isPending ? (
						<span className="inline-flex items-center gap-1.5 text-xs text-accent">
							<span className="size-1.5 animate-pulse rounded-full bg-accent" />
							сохраняется…
						</span>
					) : null}
				</div>
			</td>

			<td className="px-5 py-4">{SHOP_TITLE[item.shop]}</td>

			<td className="px-5 py-4 tabular-nums">{formatStock(item.stock)}</td>

			<td className="px-5 py-4">
				{item.status.kind === "stopped" ? (
					<div className="flex flex-wrap items-center gap-2">
						<Badge tone="accent">
							{STOP_REASON_LABELS[item.status.reason]}
						</Badge>
						<Badge tone="muted">{formatUntil(item.status.until)}</Badge>
					</div>
				) : (
					<Badge tone="success">В продаже</Badge>
				)}
			</td>

			<td className="px-5 py-4">
				<div className="flex items-center justify-end gap-2">
					<Button
						variant="secondary"
						disabled={isPending}
						onClick={() => onOpenPanel(item)}
						title={
							isStopped ? "Изменить причину и срок" : "Поставить в стоп-лист"
						}
					>
						{isStopped ? "Изменить" : "В стоп-лист"}
					</Button>

					{isStopped ? (
						<Button
							variant={item.stock > 0 ? "restore" : "forbidden"}
							disabled={!canResume || isPending}
							onClick={() => onResume(item)}
							title={resumeHint}
							aria-disabled={!canResume}
						>
							Вернуть в продажу
						</Button>
					) : null}
				</div>
			</td>
		</tr>
	);
}

function TableSkeleton() {
	return (
		<div className="overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-sm">
			<div className="flex flex-col gap-3">
				{Array.from({ length: 7 }, (_, index) => (
					<div
						key={index}
						className="h-10 animate-pulse rounded-lg bg-black/5"
					/>
				))}
			</div>
		</div>
	);
}
