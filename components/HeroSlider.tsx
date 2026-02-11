'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    active: boolean;
}

export default function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Mouse/touch drag state
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    const sliderRef = useRef<HTMLElement>(null);

    useEffect(() => {
        fetch('/api/db/slides', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data: Slide[]) => {
                const activeSlides = data.filter((s) => s.active);
                setSlides(activeSlides);
            })
            .catch(() => {
                setSlides([
                    {
                        id: 1,
                        title: 'Arvix Premium.',
                        subtitle: 'Profesyonel spor salonları için yüksek kalitede fitness ekipmanları',
                        image: '',
                        active: true,
                    },
                ]);
            });
    }, []);

    const nextSlide = useCallback(() => {
        if (slides.length > 1) {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length > 1) {
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        }
    }, [slides.length]);

    // Auto-play (pause on drag)
    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length, isPaused]);

    // Mouse drag handlers
    const handleDragStart = useCallback((clientX: number) => {
        isDragging.current = true;
        startX.current = clientX;
        currentX.current = clientX;
        setIsPaused(true);
    }, []);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging.current) return;
        currentX.current = clientX;
    }, []);

    const handleDragEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const diff = startX.current - currentX.current;
        const threshold = 50; // minimum px to trigger slide change

        if (diff > threshold) {
            nextSlide();
        } else if (diff < -threshold) {
            prevSlide();
        }

        // Resume auto-play after 2s
        setTimeout(() => setIsPaused(false), 2000);
    }, [nextSlide, prevSlide]);

    // Mouse events
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    }, [handleDragStart]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        handleDragMove(e.clientX);
    }, [handleDragMove]);

    const onMouseUp = useCallback(() => {
        handleDragEnd();
    }, [handleDragEnd]);

    const onMouseLeave = useCallback(() => {
        if (isDragging.current) handleDragEnd();
    }, [handleDragEnd]);

    // Touch events
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientX);
    }, [handleDragStart]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientX);
    }, [handleDragMove]);

    const onTouchEnd = useCallback(() => {
        handleDragEnd();
    }, [handleDragEnd]);

    if (slides.length === 0) {
        return (
            <section className="relative min-h-[600px] flex items-center justify-center bg-neutral-900 text-white">
                <div className="text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-bold">Arvix Premium.</h1>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sliderRef}
            className="relative min-h-[600px] overflow-hidden select-none"
            style={{ cursor: slides.length > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: index === currentSlide ? 1 : 0, zIndex: index === currentSlide ? 1 : 0 }}
                >
                    {/* Background */}
                    {slide.image ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                draggable={false}
                            />
                            <div className="absolute inset-0 bg-black/50" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-neutral-900" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-center min-h-[600px] text-white">
                        <div className="text-center px-6">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                                {slide.title}
                            </h1>
                            {slide.subtitle && (
                                <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                                    {slide.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                        aria-label="Önceki"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                        aria-label="Sonraki"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/40'
                                }`}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
