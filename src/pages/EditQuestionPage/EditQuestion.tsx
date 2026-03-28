import { useActionState, type FC } from "react";
import { Loader } from "../../components/Loader";
import { QuestionForm } from "../../components/QuestionForm";
import cls from "./EditQuestionPage.module.css";
import { delayFn } from "../../helpers/delayFn";
import { toast } from "react-toastify";
import { API_URL } from "../../constants/global.constants";
import { dateFormat } from "../../helpers/dateFormat";
import { useFetch } from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import type { IQuestionCard, IQuestionCardState } from "../../types/global.types";

const editCardAction = async (_prevState: Partial<IQuestionCardState>, formData: FormData) => {
  try {
    await delayFn();

    const newQuestion = Object.fromEntries(formData);
    const resources = (newQuestion.resources as string).trim();
    const isClearForm = newQuestion.clearForm;
    const questionId = newQuestion.questionId;

    const response = await fetch(`${API_URL}/react/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        question: newQuestion.question,
        answer: newQuestion.answer,
        description: newQuestion.description,
        resources: resources.length ? resources.split(",") : [],
        level: Number(newQuestion.level),
        completed: false,
        editDate: dateFormat(new Date()),
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const question = await response.json();
    toast.success("New question is edited succesfully!");

    return isClearForm ? {} : question;
  } catch (error: any) {
    toast.error(error?.message);
    return {};
  }
};

export interface IEditQuestionProps {
  initialState: IQuestionCard;
}

export const EditQuestion: FC<IEditQuestionProps> = ({ initialState }) => {
  const navigate = useNavigate();
  const [formState, formAction, isPending] = useActionState<Partial<IQuestionCardState>, FormData>(editCardAction, {
    ...initialState,
    clearForm: false,
  });

  const [removeQuestion, isQuestionRemoving] = useFetch(async () => {
    await fetch(`${API_URL}/react/${initialState.id}`, {
      method: "DELETE",
    });

    toast.success("The question has been succesfully removed!");
    navigate("/");
  });

  const onRemoveQuestionHandler = () => {
    const isRemove = confirm("Are you sure?");

    isRemove && removeQuestion();
  };

  return (
    <>
      {(isPending || isQuestionRemoving) && <Loader />}
      <h1 className={cls.formTitle}>Edit question</h1>
      <div className={cls.formContainer}>
        <button className={cls.removeBtn} disabled={isPending || isQuestionRemoving} onClick={onRemoveQuestionHandler}>
          X
        </button>
        <QuestionForm
          formAction={formAction}
          cardState={formState}
          isPending={isPending || isQuestionRemoving}
          submitBtnText="Edit Question"
        />
      </div>
    </>
  );
};
