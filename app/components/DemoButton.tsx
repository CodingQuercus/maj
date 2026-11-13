'use client';

import { useFormStatus } from 'react-dom';
import { type VariantProps } from 'class-variance-authority';

import { Button, buttonVariants } from '@/components/ui/button';
import { loginAsDemo } from '@/app/actions/demo';

type DemoButtonProps = VariantProps<typeof buttonVariants> & {
    className?: string;
    children?: React.ReactNode;
};

// Submit button that reads the pending state of its parent <form>.
function SubmitButton({ children, ...props }: DemoButtonProps) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" loading={pending} {...props}>
            {children}
        </Button>
    );
}

// "Try demo" button: signs in to the shared demo account and shows a spinner meanwhile.
export default function DemoButton({
    children = 'Try demo',
    ...props
}: DemoButtonProps) {
    return (
        <form action={loginAsDemo}>
            <SubmitButton {...props}>{children}</SubmitButton>
        </form>
    );
}
