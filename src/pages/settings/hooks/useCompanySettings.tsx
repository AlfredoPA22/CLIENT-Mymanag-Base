import { useMutation, useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import { UPDATE_COMPANY } from "../../../graphql/mutations/Company";
import { DETAIL_COMPANY } from "../../../graphql/queries/Company";
import { setCompanyInfo } from "../../../redux/slices/authSlice";
import { ICompanyInput } from "../../../utils/interfaces/Company";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";

const useCompanySettings = () => {
  const dispatch = useDispatch();

  const { data, loading: loadingCompany } = useQuery(DETAIL_COMPANY, {
    fetchPolicy: "network-only",
  });

  const [updateCompany, { loading: loadingUpdate }] = useMutation(
    UPDATE_COMPANY,
    { refetchQueries: [{ query: DETAIL_COMPANY }] }
  );

  const company = data?.detailCompany ?? null;

  const saveCompany = async (input: ICompanyInput) => {
    const { data: result } = await updateCompany({ variables: { input } });
    const updated = result?.updateCompany;
    if (updated?.currency) {
      dispatch(setCompanyInfo({ currency: updated.currency }));
    }
    showToast({
      detail: "Datos de la empresa actualizados",
      severity: ToastSeverity.Success,
    });
  };

  return {
    company,
    loadingCompany,
    loadingUpdate,
    saveCompany,
  };
};

export default useCompanySettings;
