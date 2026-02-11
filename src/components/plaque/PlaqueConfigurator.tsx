import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Type, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/apiClient';
import { toast } from 'sonner';

interface PlaqueConfiguratorProps {
    initialPhotoUrl?: string;
    initialMessage?: string;
    onSave: (photoUrl: string | null, message: string) => void;
    onCancel: () => void;
    productName?: string;
    productImage?: string;
    configurationType?: 'message_only' | 'message_and_photo';
}

const MAX_FILE_SIZE_MB = 5;
const MAX_MESSAGE_LENGTH = 50;

export default function PlaqueConfigurator({
    initialPhotoUrl = '',
    initialMessage = '',
    onSave,
    onCancel,
    productName = 'Votre plaque',
    productImage,
    configurationType = 'message_and_photo'
}: PlaqueConfiguratorProps) {
    const showPhoto = configurationType === 'message_and_photo';
    const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl || null);
    const [message, setMessage] = useState(initialMessage);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image (JPG, PNG, etc.)');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            toast.error(
                <div className="flex flex-col gap-1">
                    <p className="font-bold">Image trop volumineuse ({Math.round(file.size / (1024 * 1024))} Mo)</p>
                    <p className="text-xs">La limite est de {MAX_FILE_SIZE_MB} Mo.</p>
                </div>
            );
            return;
        }

        setIsUploading(true);
        try {
            const uploadedUrl = await api.storage.upload(file, 'plaque-photos');
            setPhotoUrl(uploadedUrl);
            toast.success('Photo téléchargée avec succès !');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(`Erreur lors du téléchargement: ${error.message || 'Erreur inconnue'}`);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const removePhoto = () => {
        setPhotoUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_MESSAGE_LENGTH) {
            setMessage(value);
        }
    };

    const handleSubmit = () => {
        if (showPhoto) {
            if (!photoUrl && !message) {
                toast.error('Veuillez ajouter une photo et un message');
                return;
            }
            if (!photoUrl) {
                toast.error('Veuillez ajouter une photo');
                return;
            }
            if (!message) {
                toast.error('Veuillez saisir un message à graver');
                return;
            }
        } else {
            if (!message) {
                toast.error('Veuillez saisir un message à graver');
                return;
            }
        }
        onSave(showPhoto ? photoUrl : null, message);
    };

    const charactersRemaining = MAX_MESSAGE_LENGTH - message.length;

    return (
        <div className="space-y-8">
            {/* Upload Section - only shown for message_and_photo */}
            {showPhoto && (
                <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h4 className="font-serif text-xl text-primary">Photo pour la plaque</h4>
                            <p className="text-xs text-primary/40">Format JPG ou PNG, 5 Mo maximum</p>
                        </div>
                    </div>

                    {photoUrl ? (
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                            <img src={photoUrl} alt="Photo sélectionnée" className="w-20 h-20 object-cover rounded-xl" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Photo téléchargée
                                </p>
                                <p className="text-xs text-green-600 mt-1">Cliquez sur le bouton pour changer</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={removePhoto}
                                className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
              ${isDragging
                                    ? 'border-accent bg-accent/5 scale-[1.02]'
                                    : 'border-primary/10 hover:border-accent/50 hover:bg-accent/5'
                                }
              ${isUploading ? 'pointer-events-none opacity-60' : ''}
            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleInputChange}
                                className="hidden"
                            />

                            {isUploading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-primary/60">Téléchargement en cours...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-accent' : 'text-primary/20'}`} />
                                    <p className="text-primary/60 mb-2">
                                        <span className="font-medium text-accent">Cliquez pour sélectionner</span> ou glissez-déposez
                                    </p>
                                    <p className="text-xs text-primary/40">JPG, PNG • Max {MAX_FILE_SIZE_MB} Mo</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Message Section */}
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-primary/5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Type className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                        <h4 className="font-serif text-xl text-primary">Message à graver</h4>
                        <p className="text-xs text-primary/40">{MAX_MESSAGE_LENGTH} caractères maximum</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Input
                        value={message}
                        onChange={handleMessageChange}
                        placeholder="Ex: À notre père bien-aimé, pour toujours dans nos cœurs"
                        className="h-14 rounded-2xl border-primary/10 focus:border-accent px-6 text-lg font-serif"
                        maxLength={MAX_MESSAGE_LENGTH}
                    />
                    <div className="flex items-center justify-between px-2">
                        <p className={`text-xs ${charactersRemaining < 10 ? 'text-amber-500' : 'text-primary/40'}`}>
                            {charactersRemaining} caractère{charactersRemaining !== 1 ? 's' : ''} restant{charactersRemaining !== 1 ? 's' : ''}
                        </p>
                        {message.length > 0 && (
                            <button
                                onClick={() => setMessage('')}
                                className="text-xs text-primary/40 hover:text-red-500 transition-colors"
                            >
                                Effacer
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-14 rounded-full border-primary/20 text-primary/60 hover:text-primary font-bold uppercase tracking-widest text-xs"
                >
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold uppercase tracking-widest text-xs gap-2"
                >
                    <Check className="w-4 h-4" />
                    Valider la configuration
                </Button>
            </div>
        </div>
    );
}
