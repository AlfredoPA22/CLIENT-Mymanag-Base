import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { FC } from "react";
import { useDispatch } from "react-redux";
import { REMOVE_SERIAL_FROM_TRANSFER_DETAIL } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER_DETAIL } from "../../graphql/queries/ProductTransfer";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";

interface SerialByTransferDetailListProps {
  transferId: string;
  transferDetailId: string;
  serials: string[];
  quantity: number;
  editMode?: boolean;
}

const SerialByTransferDetailList: FC<SerialByTransferDetailListProps> = ({
  transferId,
  transferDetailId,
  serials,
  quantity,
  editMode = true,
}) => {
  const dispatch = useDispatch();

  const [removeSerial] = useMutation(REMOVE_SERIAL_FROM_TRANSFER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_PRODUCT_TRANSFER_DETAIL,
        variables: { transferId },
      },
    ],
  });

  const handleRemove = async (serial: string) => {
    try {
      dispatch(setIsBlocked(true));
      await removeSerial({
        variables: { transferDetailId, serial },
      });
      showToast({ detail: "Serial eliminado.", severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const assigned = serials.length;
  const complete = assigned >= quantity;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Seriales asignados:</span>
        <Tag
          severity={complete ? "success" : "warning"}
          value={`${assigned} / ${quantity}`}
        />
        {complete && (
          <span className="text-xs text-green-600 font-medium">Completo</span>
        )}
      </div>

      {/* Serial list */}
      {serials.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin seriales asignados.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {serials.map((serial) => (
            <li
              key={serial}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
            >
              <span className="font-mono text-sm text-gray-800">{serial}</span>
              {editMode && (
                <Button
                  icon="pi pi-times"
                  text
                  severity="danger"
                  size="small"
                  tooltip="Quitar serial"
                  onClick={() => handleRemove(serial)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SerialByTransferDetailList;
