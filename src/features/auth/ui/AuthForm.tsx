import {
  Stepper,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Code,
} from "@mantine/core";
import { useState } from "react";
import s from "./AuthForm.module.scss";
import { useForm } from "@mantine/form";
import { ValidateForm } from "./utils";
import { register, confirm, getUser } from "../../../enteties/user/api";
import md5 from "md5";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const history = useNavigate();
  const form = useForm({
    initialValues: {
      name: "",
      surname: "",
      middlename: "",
      role: "",
      password: "",
      confirmPassword: "",
      email: "",
      code: "",
    },

    validate: (values) => {
      return ValidateForm(active, values);
    },
  });

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      if (current === 1) {
        register({
          name: form.values.name,
          surname: form.values.surname,
          middlename: form.values.middlename,
          role: form.values.role,
          email: form.values.email,
          password: md5(form.values.password),
        })
          .then((response) => {
            setError(null);
            const data = response.body.id;
            console.log(data);
            setUserID(data);
          })
          .catch((error) => {
            if (error.response.status === 409) {
              setError("Уже есть аккаунт привязанный к этой почте");
            }
            setError("Произошла ошибка");
            return;
          });
      }

      if (current === 2) {
        confirm({
          code: form.values.code,
          id: userID!,
        })
          .then(() => {
            setCodeError(null);
            history("/main"); 
          })
          .catch((error) => {
            setCodeError("Произошла ошибка");
          });
      }
      return current < 3 ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <>
      <Stepper
        active={active}
        classNames={{ root: s.root, content: s.content }}
      >
        <Stepper.Step label="Первый шаг" description="Основные данные">
          <TextInput
            label="Фамилия"
            placeholder="Иванов"
            withAsterisk
            {...form.getInputProps("surname")}
          />
          <TextInput
            label="Имя"
            placeholder="Иван"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Отчество"
            placeholder="Иванович"
            {...form.getInputProps("middlename")}
          />
          <TextInput
            label="Должность"
            placeholder="Ведущий инженер"
            {...form.getInputProps("role")}
          />
        </Stepper.Step>

        <Stepper.Step
          label="Второй шаг"
          description="Настройка данных аккаунта"
        >
          <p className={s.error}>{error}</p>
          <TextInput
            mt="md"
            label="Email"
            placeholder="example@mail.com"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Пароль"
            description="Не менее 6ти символов"
            withAsterisk
            {...form.getInputProps("password")}
          />
          <PasswordInput
            label="Повторите пароль"
            placeholder="Повторите пароль"
            withAsterisk
            {...form.getInputProps("confirmPassword")}
          />
        </Stepper.Step>

        <Stepper.Step label="Третий шаг" description="Подтверждение">
          <h2>
            Код подтверждения отправлен на Вашу почту: {form.values.email}
          </h2>
          <p className={s.error}>{codeError}</p>
          <TextInput
            label="Введите код подтверждения"
            placeholder="123456"
            {...form.getInputProps("code")}
            withAsterisk
            className={s.code}
          />
        </Stepper.Step>
        <Stepper.Completed>
          <h2>Вы успешно зарегестрировались!</h2>
          <Button variant="light" className={s.logbtn}>
            Войти
          </Button>
          <Code block mt="xl">
            {JSON.stringify(form.values, null, 2)}
          </Code>
        </Stepper.Completed>
      </Stepper>

      <Group justify="flex-end" mt="xl">
        {active !== 0 && (
          <Button variant="default" onClick={prevStep}>
            Назад
          </Button>
        )}
        {active !== 3 && <Button onClick={nextStep}>Дальше</Button>}
      </Group>
    </>
  );
};

export default AuthForm;
