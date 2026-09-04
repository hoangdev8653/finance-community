import React from 'react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  postTitle: string;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent
        title="Xóa bài viết"
        description="Bạn có chắc muốn xóa bài phân tích này không? Bài viết sẽ bị gỡ khỏi bảng tin công khai và trang cá nhân."
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Bài viết:</p>
              <p className="line-clamp-2 mt-0.5 text-foreground italic">"{postTitle}"</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onConfirm}
              isLoading={isDeleting}
            >
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
