import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { ChefHat, Clock3, QrCode, ShieldCheck } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Admin Login" />

            <Card className="overflow-hidden rounded-lg border shadow-sm">
                <CardContent className="p-0">
                    <div className="bg-muted/50 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ChefHat className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">LTU Food Admin</p>
                                <p className="text-sm text-muted-foreground">
                                    Manage tables, menu, and orders
                                </p>
                            </div>
                        </div>
                        
                    </div>

                    <div className="p-6">
                        {status && (
                            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="admin@ltufood.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">Password</Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="ml-auto text-sm"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="remember" name="remember" tabIndex={3} />
                                            <Label htmlFor="remember" className="text-sm">
                                                Keep me signed in
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Log in to dashboard
                                        </Button>
                                    </div>

                                    {canRegister && (
                                        <div className="text-center text-sm text-muted-foreground">
                                            Need an admin account?{' '}
                                            <TextLink href={register()} tabIndex={5}>
                                                Create one
                                            </TextLink>
                                        </div>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>
                </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
                For restaurant staff only. Customers can order from the table QR page.
            </p>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to manage your restaurant workflow',
};
