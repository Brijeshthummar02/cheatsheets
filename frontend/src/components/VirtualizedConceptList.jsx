import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import ConceptCard from './ConceptCard';
import { Skeleton } from './ui/skeleton';

/**
 * VirtualizedConceptList - Renders concepts with intersection observer-based lazy loading
 * Only renders concepts that are in or near the viewport for optimal performance
 */
const VirtualizedConceptList = memo(({ concepts, themeColor, type }) => {
    const [visibleIndices, setVisibleIndices] = useState(new Set());
    const observerRef = useRef(null);
    const placeholderRefs = useRef(new Map());

    // Determine initial batch size based on viewport
    const initialBatchSize = useMemo(() => {
        // Render first few cards immediately for perceived performance
        return Math.min(3, concepts.length);
    }, [concepts.length]);

    // Initialize visibility for first batch
    useEffect(() => {
        const initial = new Set();
        for (let i = 0; i < initialBatchSize; i++) {
            initial.add(i);
        }
        setVisibleIndices(initial);
    }, [initialBatchSize]);

    // Setup intersection observer for lazy loading
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '200px 0px', // Load 200px before entering viewport
            threshold: 0
        };

        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.dataset.index, 10);
                    setVisibleIndices(prev => {
                        const newSet = new Set(prev);
                        newSet.add(index);
                        return newSet;
                    });
                    // Once visible, stop observing
                    observerRef.current?.unobserve(entry.target);
                }
            });
        }, options);

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    // Observe placeholder elements
    const setPlaceholderRef = useCallback((element, index) => {
        if (element && !visibleIndices.has(index) && observerRef.current) {
            placeholderRefs.current.set(index, element);
            observerRef.current.observe(element);
        }
    }, [visibleIndices]);

    return (
        <div className="space-y-6 md:space-y-8">
            {concepts.map((concept, idx) => {
                const isVisible = visibleIndices.has(idx);

                if (isVisible) {
                    return (
                        <ConceptCard
                            key={idx}
                            concept={concept}
                            themeColor={themeColor}
                            type={type}
                        />
                    );
                }

                // Render placeholder for unloaded cards
                return (
                    <div
                        key={idx}
                        ref={(el) => setPlaceholderRef(el, idx)}
                        data-index={idx}
                        className="concept-placeholder"
                    >
                        <ConceptCardSkeleton />
                    </div>
                );
            })}
        </div>
    );
});

VirtualizedConceptList.displayName = 'VirtualizedConceptList';

/**
 * Skeleton placeholder for concept cards
 */
const ConceptCardSkeleton = memo(() => {
    return (
        <div className="surface-card p-5 md:p-6 animate-pulse">
            <div className="space-y-3 md:space-y-4">
                {/* Title */}
                <Skeleton className="h-6 w-48 md:w-64" />
                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Code block */}
                <Skeleton className="h-24 md:h-32 w-full rounded-xl" />
                {/* Key points */}
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
            </div>
        </div>
    );
});

ConceptCardSkeleton.displayName = 'ConceptCardSkeleton';

export default VirtualizedConceptList;
export { ConceptCardSkeleton };
