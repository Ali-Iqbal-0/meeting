'use client';
import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[520px] flex-col gap-6 border-none bg-gray-700 px-6 py-9 text-white">
        <DialogHeader>
          <DialogTitle className={cn('text-3xl font-bold leading-[42px]', className)}>
            {title}
          </DialogTitle>
        </DialogHeader>

        {children && (
          <div className="text-gray-200">
            {children}
          </div>
        )}

        {image && (
          <div className="flex justify-center">
            <Image src={image} alt={`${title} icon`} width={72} height={72} />
          </div>
        )}

        {handleClick && (
          <button
            type="button"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={handleClick}
          >
            {buttonIcon && (
              <Image src={buttonIcon} alt={`${buttonText || 'Action'} icon`} width={13} height={13} />
            )}
            {buttonText || 'Schedule Meeting'}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
