import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    avatar: string | null;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [option, setOption] = useState<"file" | "url">("file");
    const getInitials = useInitials();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        avatar: auth.user.avatar ?? null,
    });

    const submit = () => {

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div className="grid gap-2">
                            <Label htmlFor="avatar" className="block text-sm font-medium">Avatar</Label>
                            <div className="mt-2 flex items-center justify-center">
                                <Avatar className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-offset-2 ring-neutral-100 dark:ring-neutral-800 transition-all duration-200 hover:scale-105">
                                    <AvatarImage
                                        src={auth.user.avatar}
                                        alt={auth.user.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-700 dark:from-neutral-700 dark:to-neutral-800 dark:text-neutral-200">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => setOption("file")}>Upload</Button>
                                <Button variant="outline" onClick={() => setOption("url")}>URL</Button>
                            </div>

                            {option === "file" && (
                                <Input
                                    id="avatar"
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('avatar', e.target.value)}
                                    required
                                    type="file"
                                    accept='.png,.jpg,.jpeg'
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                            )}

                            {option === "url" && (
                            <Input
                                id="avatar"
                                className="mt-1 block w-full"
                                value={data.avatar ?? ''}
                                onChange={(e) => setData('avatar', e.target.value)}
                                required
                                type="url"
                                autoComplete="name"
                                placeholder="Avatar URL"
                            />
                            )}

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button onClick={submit} disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
