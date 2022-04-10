import React from "react";
import { Button, Form, Stack } from "react-bootstrap";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IconContext } from "react-icons";
import { FaDropbox, FaCheck } from "react-icons/fa";

export type LinkProps = {
  publicLink: string;
};

type LinkFormProps = {
  onSubmit: SubmitHandler<LinkProps>;
  defaultValues: LinkProps;
};
export function LinkForm(props: LinkFormProps) {
  const { onSubmit, defaultValues } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<LinkProps>({
    defaultValues,
  });

  const onSubmitLocal = async (data: LinkProps) => {
    const res = await onSubmit(data);
    if (res) {
      reset(data);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmitLocal)}>
      <Form.Group>
        <Form.Label>
          <h6 className="text-muted">
            <small>
              <IconContext.Provider value={{ className: "text-info me-1" }}>
                <FaDropbox />
              </IconContext.Provider>
              Dropbox Public Link:
            </small>
          </h6>
        </Form.Label>
        <Stack direction="horizontal" gap={3}>
          <Controller
            name="publicLink"
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                type="text"
                className="me-auto"
                placeholder="Dropbox Public Link..."
              />
            )}
          />
          <Button
            variant="info"
            className="flex-shrink-0 text-white"
            type="submit"
            disabled={!isDirty}
          >
            <FaCheck /> Save
          </Button>
        </Stack>
      </Form.Group>
    </Form>
  );
}
