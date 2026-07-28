-- Project Atlas PostgreSQL / Supabase Database Schema
-- Provides high-performance persistent caching, user bookmarks, search telemetry, and topic graphs.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Search Topics Cache Table
CREATE TABLE IF NOT EXISTS search_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    search_count INT DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_topics_slug ON search_topics(slug);
CREATE INDEX IF NOT EXISTS idx_search_topics_count ON search_topics(search_count DESC);

-- 2. Category Cache Table (For fast response times)
CREATE TABLE IF NOT EXISTS category_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_slug VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    page INT DEFAULT 1,
    payload JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_topic_category_page UNIQUE(topic_slug, category, page)
);

CREATE INDEX IF NOT EXISTS idx_category_cache_lookup ON category_cache(topic_slug, category, page);

-- 3. Saved User Bookmarks Table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- NULL for anonymous local sessions
    topic VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_topic ON user_bookmarks(topic);

-- 4. Knowledge Graph Connections Table
CREATE TABLE IF NOT EXISTS knowledge_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_topic VARCHAR(255) NOT NULL,
    target_topic VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_graph_edge UNIQUE(source_topic, target_topic, relationship)
);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE search_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph ENABLE ROW LEVEL SECURITY;

-- Allow public read access to topics and caches
CREATE POLICY "Public search topics selection" ON search_topics FOR SELECT USING (true);
CREATE POLICY "Public category cache selection" ON category_cache FOR SELECT USING (true);
CREATE POLICY "Public knowledge graph selection" ON knowledge_graph FOR SELECT USING (true);
CREATE POLICY "Public bookmarks access" ON user_bookmarks FOR ALL USING (true);
