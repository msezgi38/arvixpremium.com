'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    active: boolean;
}

interface SliderSettings {
    height: number;          // px height
    mobileHeight: number;    // mobile px height
    effect: 'fade' | 'slide' | 'zoom' | 'kenburns';
    speed: number;           // auto-play interval in ms
    overlayOpacity: number;  // 0-1
    transitionDuration: number; // ms
}

const defaultSettings: SliderSettings = {
    height: 600,
    mobileHeight: 400,
    effect: 'fade',
    speed: 5000,
    overlayOpacity: 0.5,
    transitionDuration: 700,
};

export default function HeroSlider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [prevSlideIndex, setPrevSlideIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [settings, setSettings] = useState<SliderSettings>(defaultSettings);
    const [animating, setAnimating] = useState(false);

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
                    { id: 1, title: 'Arvix Premium.', subtitle: 'Profesyonel spor salonları için yüksek kalitede fitness ekipmanları', image: '', active: true },
                ]);
            });

        // Load slider settings
        fetch('/api/db/settings?key=slider-settings', { cache: 'no-store' })
            .then(r => r.json())
            .then(d => { if (d && Object.keys(d).length > 0) setSettings({ ...defaultSettings, ...d }); })
            .catch(() => { });
    }, []);

    const goToSlide = useCallback((index: number) => {
        if (animating || index === currentSlide) return;
        setAnimating(true);
        setPrevSlideIndex(currentSlide);
        setCurrentSlide(index);
        setTimeout(() => setAnimating(false), settings.transitionDuration);
    }, [currentSlide, animating, settings.transitionDuration]);

    const nextSlide = useCallback(() => {
        if (slides.length > 1) {
            goToSlide((currentSlide + 1) % slides.length);
        }
    }, [slides.length, currentSlide, goToSlide]);

    const prevSlideNav = useCallback(() => {
        if (slides.length > 1) {
            goToSlide((currentSlide - 1 + slides.length) % slides.length);
        }
    }, [slides.length, currentSlide, goToSlide]);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1 || isPaused) return;
        const interval = setInterval(nextSlide, settings.speed);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length, isPaused, settings.speed]);

    // Drag handlers
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
        if (diff > 50) nextSlide();
        else if (diff < -50) prevSlideNav();
        setTimeout(() => setIsPaused(false), 2000);
    }, [nextSlide, prevSlideNav]);

    const onMouseDown = useCallback((e: React.MouseEvent) => { e.preventDefault(); handleDragStart(e.clientX); }, [handleDragStart]);
    const onMouseMove = useCallback((e: React.MouseEvent) => { handleDragMove(e.clientX); }, [handleDragMove]);
    const onMouseUp = useCallback(() => { handleDragEnd(); }, [handleDragEnd]);
    const onMouseLeave = useCallback(() => { if (isDragging.current) handleDragEnd(); }, [handleDragEnd]);
    const onTouchStart = useCallback((e: React.TouchEvent) => { handleDragStart(e.touches[0].clientX); }, [handleDragStart]);
    const onTouchMove = useCallback((e: React.TouchEvent) => { handleDragMove(e.touches[0].clientX); }, [handleDragMove]);
    const onTouchEnd = useCallback(() => { handleDragEnd(); }, [handleDragEnd]);

    // Transition styles per effect
    const getSlideStyle = (index: number): React.CSSProperties => {
        const isCurrent = index === currentSlide;
        const isPrev = index === prevSlideIndex && animating;
        const dur = `${settings.transitionDuration}ms`;

        switch (settings.effect) {
            case 'slide': {
                let tx = '100%';
                if (isCurrent) tx = '0%';
                else if (isPrev) tx = '-100%';
                return {
                    transform: `translateX(${tx})`,
                    transition: `transform ${dur} ease-in-out`,
                    zIndex: isCurrent ? 2 : isPrev ? 1 : 0,
                    opacity: 1,
                };
            }
            case 'zoom': {
                return {
                    opacity: isCurrent ? 1 : 0,
                    transform: isCurrent ? 'scale(1)' : 'scale(1.15)',
                    transition: `opacity ${dur} ease-in-out, transform ${dur} ease-in-out`,
                    zIndex: isCurrent ? 1 : 0,
                };
            }
            case 'kenburns': {
                return {
                    opacity: isCurrent ? 1 : 0,
                    transition: `opacity ${dur} ease-in-out`,
                    zIndex: isCurrent ? 1 : 0,
                };
            }
            case 'fade':
            default: {
                return {
                    opacity: isCurrent ? 1 : 0,
                    transition: `opacity ${dur} ease-in-out`,
                    zIndex: isCurrent ? 1 : 0,
                };
            }
        }
    };

    const getImageStyle = (index: number): React.CSSProperties => {
        if (settings.effect === 'kenburns' && index === currentSlide) {
            return {
                animation: `kenburns ${settings.speed + settings.transitionDuration}ms ease-in-out forwards`,
            };
        }
        return {};
    };

    if (slides.length === 0) {
        return (
            <section className="relative flex items-center justify-center bg-neutral-900 text-white" style={{ minHeight: `${settings.height}px` }}>
                <div className="text-center px-6">
                    <h1 className="text-5xl md:text-7xl font-bold">Arvix Premium.</h1>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sliderRef}
            className="relative overflow-hidden select-none"
            style={{
                height: `${settings.mobileHeight}px`,
                cursor: slides.length > 1 ? 'grab' : 'default',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Responsive height via CSS */}
            <style jsx>{`
                @media (min-width: 768px) {
                    section { height: ${settings.height}px !important; }
                }
                @keyframes kenburns {
                    0% { transform: scale(1) translateX(0); }
                    100% { transform: scale(1.12) translateX(-2%); }
                }
            `}</style>

            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className="absolute inset-0"
                    style={getSlideStyle(index)}
                >
                    {slide.image ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                draggable={false}
                                style={getImageStyle(index)}
                            />
                            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${settings.overlayOpacity})` }} />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-neutral-900" />
                    )}

                    <div className="relative z-10 flex items-center justify-center text-white" style={{ minHeight: `${settings.mobileHeight}px` }}>
                        <style jsx>{`@media (min-width: 768px) { div { min-height: ${settings.height}px !important; } }`}</style>
                        <div className="text-center px-6">
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight">{slide.title}</h1>
                            {slide.subtitle && (
                                <p className="mt-4 text-base md:text-xl text-white/80 max-w-2xl mx-auto">{slide.subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlideNav(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                        aria-label="Önceki"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                        aria-label="Sonraki"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </>
            )}

            {/* Dot Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/40'}`}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
