import { View } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import Text from './Text';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onClose }: {
  open: boolean; title: string; message: string; confirmLabel?: string; loading?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <View className="flex-col-reverse gap-2">
          <Button variant="secondary" onPress={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onPress={onConfirm} loading={loading}>{confirmLabel}</Button>
        </View>
      }
    >
      <Text className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</Text>
    </Modal>
  );
}
