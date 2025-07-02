import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Link,
    Collapse,
    IconButton,
    useTheme,
    Chip
} from '@mui/material';
import { styled } from '@mui/system';
import slugify from 'slugify';
import {
    ExpandMore,
    ChevronRight,
    MenuBook,
    FiberManualRecord
} from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';

const TocContainer = styled(Box)(({ theme, darkMode }) => ({
    backgroundColor: darkMode ? 'rgba(44, 45, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2, 1, 2, 2),
    transition: 'all 0.3s ease',
    boxShadow: darkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
}));

const TocHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    paddingRight: theme.spacing(1),
}));

const TocLink = styled(Link)(({ theme, active, darkMode, level }) => ({
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    textDecoration: 'none',
    padding: theme.spacing(0.75, 1.5),
    paddingLeft: theme.spacing(1.5 + (level - 1) * 2),
    margin: theme.spacing(0.5, 0),
    borderRadius: theme.shape.borderRadius,
    position: 'relative',
    fontWeight: active ? 700 : 400,
    fontSize: level === 1 ? '0.95rem' : '0.9rem',
    color: active
        ? theme.palette.primary.main
        : (darkMode ? theme.palette.text.secondary : theme.palette.text.primary),
    transition: 'all 0.2s ease-in-out',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: active ? '70%' : 0,
        width: '4px',
        backgroundColor: theme.palette.primary.main,
        borderRadius: '0 4px 4px 0',
        transition: 'all 0.2s ease-in-out',
    },
    '&:hover': {
        textDecoration: 'none',
        color: theme.palette.primary.main,
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : theme.palette.action.hover,
    },
}));

const TableOfContents = ({ content }) => {
    const { mode } = useContext(ThemeContext);
    const theme = useTheme();
    const [headings, setHeadings] = useState([]);
    const [activeSlug, setActiveSlug] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);
    const darkMode = mode === 'dark';

    useEffect(() => {
        const extractedHeadings = [];
        const regex = /<h([1-6]).*?>(.*?)<\/h\1>/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const level = parseInt(match[1], 10);
            const text = match[2].replace(/<[^>]*>?/gm, '');
            const slug = slugify(text, { lower: true, strict: true });
            if (text) {
                extractedHeadings.push({ level, text, slug });
            }
        }
        setHeadings(extractedHeadings);
    }, [content]);

    useEffect(() => {
        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstVisible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

                if (firstVisible) {
                    setActiveSlug(firstVisible.target.id);
                }
            },
            {
                rootMargin: '0px 0px -80% 0px',
                threshold: 0.1
            }
        );

        headings.forEach(heading => {
            const element = document.getElementById(heading.slug);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            headings.forEach(heading => {
                const element = document.getElementById(heading.slug);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    return (
        <TocContainer darkMode={darkMode}>
            <TocHeader onClick={() => setIsExpanded(!isExpanded)}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <MenuBook sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ m: 0, fontSize: '1.1rem' }}>
                        Nội dung bài viết
                    </Typography>
                </Box>
                <IconButton size="small">
                    {isExpanded ? <ExpandMore /> : <ChevronRight />}
                </IconButton>
            </TocHeader>
            <Collapse in={isExpanded}>
                <Box
                    component="nav"
                    sx={{
                        mt: 2,
                        maxHeight: 'calc(100vh - 250px)',
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '5px' },
                        '&::-webkit-scrollbar-track': { background: 'transparent' },
                        '&::-webkit-scrollbar-thumb': {
                            background: darkMode ? '#555' : '#ccc',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: darkMode ? '#777' : '#aaa',
                        },
                    }}
                >
                    {headings.map((heading) => (
                        <TocLink
                            key={heading.slug}
                            href={`#${heading.slug}`}
                            active={activeSlug === heading.slug}
                            darkMode={darkMode}
                            level={heading.level}
                        >
                            <Typography variant="body2" component="span" sx={{ fontWeight: 'inherit' }}>
                                {heading.text}
                            </Typography>
                        </TocLink>
                    ))}
                </Box>
            </Collapse>
        </TocContainer>
    );
};

export default TableOfContents;
