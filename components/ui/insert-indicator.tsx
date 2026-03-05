/** 挿入位置を示すインジケーターライン */
export function InsertIndicator() {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="h-2 w-2 rounded-full bg-primary" />
      <div className="h-0.5 flex-1 bg-primary" />
    </div>
  )
}
