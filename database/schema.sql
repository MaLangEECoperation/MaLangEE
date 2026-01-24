--
-- PostgreSQL database dump
--
 
-- Dumped from database version 15.15 (Ubuntu 15.15-1.pgdg24.04+1)
-- Dumped by pg_dump version 15.15 (Ubuntu 15.15-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    session_id character varying NOT NULL,
    role character varying NOT NULL,
    content character varying NOT NULL,
    "timestamp" character varying NOT NULL,
    duration_sec double precision,
    is_feedback boolean DEFAULT false,
    feedback character varying,
    reason character varying
);


ALTER TABLE public.chat_messages OWNER TO aimaster;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: aimaster
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chat_messages_id_seq OWNER TO aimaster;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aimaster
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: conversation_sessions; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.conversation_sessions (
    session_id character varying NOT NULL,
    title character varying,
    started_at character varying NOT NULL,
    ended_at character varying NOT NULL,
    total_duration_sec double precision,
    user_speech_duration_sec double precision,
    scenario_place character varying,
    scenario_partner character varying,
    scenario_goal character varying,
    scenario_state_json text,
    scenario_completed_at timestamp with time zone,
    deleted boolean,
    voice character varying,
    show_text boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id integer,
    scenario_summary text,
    is_analyzed boolean DEFAULT false,
    scenario_id character varying
);


ALTER TABLE public.conversation_sessions OWNER TO aimaster;

--
-- Name: scenario_definitions; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.scenario_definitions (
    id character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    place character varying,
    partner character varying,
    goal character varying,
    level integer,
    category character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.scenario_definitions OWNER TO aimaster;

--
-- Name: scenario_statistics; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.scenario_statistics (
    scenario_id character varying NOT NULL,
    total_plays integer,
    avg_turns double precision,
    top_keywords json,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.scenario_statistics OWNER TO aimaster;

--
-- Name: session_analytics; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.session_analytics (
    session_id character varying NOT NULL,
    user_id integer,
    word_count integer,
    unique_words_count integer,
    richness_score double precision,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.session_analytics OWNER TO aimaster;

--
-- Name: users; Type: TABLE; Schema: public; Owner: aimaster
--

CREATE TABLE public.users (
    id integer NOT NULL,
    login_id character varying NOT NULL,
    hashed_password character varying NOT NULL,
    nickname character varying NOT NULL,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO aimaster;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: aimaster
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO aimaster;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aimaster
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_sessions conversation_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.conversation_sessions
    ADD CONSTRAINT conversation_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: scenario_definitions scenario_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.scenario_definitions
    ADD CONSTRAINT scenario_definitions_pkey PRIMARY KEY (id);


--
-- Name: scenario_statistics scenario_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.scenario_statistics
    ADD CONSTRAINT scenario_statistics_pkey PRIMARY KEY (scenario_id);


--
-- Name: session_analytics session_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.session_analytics
    ADD CONSTRAINT session_analytics_pkey PRIMARY KEY (session_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_chat_messages_session_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE INDEX ix_chat_messages_session_id ON public.chat_messages USING btree (session_id);


--
-- Name: ix_conversation_sessions_session_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE INDEX ix_conversation_sessions_session_id ON public.conversation_sessions USING btree (session_id);


--
-- Name: ix_scenario_statistics_scenario_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE INDEX ix_scenario_statistics_scenario_id ON public.scenario_statistics USING btree (scenario_id);


--
-- Name: ix_session_analytics_user_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE INDEX ix_session_analytics_user_id ON public.session_analytics USING btree (user_id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_login_id; Type: INDEX; Schema: public; Owner: aimaster
--

CREATE UNIQUE INDEX ix_users_login_id ON public.users USING btree (login_id);


--
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.conversation_sessions(session_id);


--
-- Name: conversation_sessions conversation_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.conversation_sessions
    ADD CONSTRAINT conversation_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: session_analytics session_analytics_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.session_analytics
    ADD CONSTRAINT session_analytics_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.conversation_sessions(session_id) ON DELETE CASCADE;


--
-- Name: session_analytics session_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aimaster
--

ALTER TABLE ONLY public.session_analytics
    ADD CONSTRAINT session_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO aimaster;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO aimaster;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO aimaster;


--
-- PostgreSQL database dump complete
--
 