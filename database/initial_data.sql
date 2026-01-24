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


--
-- Data for Name: scenario_definitions; Type: TABLE DATA; Schema: public; Owner: aimaster
--

INSERT INTO public.scenario_definitions VALUES ('airport_checkin', '공항 체크인 (Airport Check-in)', '공항 체크인 카운터에서 창가 좌석을 요청하고 수하물을 부쳐보세요.', 'Airport Check-in Counter', 'Check-in Agent', 'Get a window seat and check baggage', 1, 'Travel', '2026-01-20 00:27:46.838126+09');
INSERT INTO public.scenario_definitions VALUES ('cafe_order', '카페 주문 (Cafe Ordering)', '스타벅스에서 아이스 아메리카노를 주문하고 커스텀 옵션을 추가해보세요.', 'Starbucks Counter', 'Busy Barista', 'Order an Iced Americano with minimal ice', 1, 'Daily', '2026-01-20 00:27:46.839965+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_001', '카페에서 커피 주문하기', '카페에서 바리스타와 대화하며 원하는 커피를 주문하는 상황', '카페', '바리스타', '원하는 음료를 정확히 주문하고 받기', 1, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_002', '병원 접수하기', '병원 접수창구에서 진료 예약 및 접수를 하는 상황', '병원', '접수 직원', '진료 접수 완료하기', 2, '의료', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_003', '마트에서 물건 찾기', '마트 직원에게 원하는 상품의 위치를 물어보는 상황', '마트', '매장 직원', '원하는 물건의 위치 파악하기', 1, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_004', '은행에서 계좌 개설하기', '은행 창구에서 새로운 계좌를 개설하는 상황', '은행', '은행원', '계좌 개설 완료하기', 3, '금융', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_005', '택시 타고 목적지 가기', '택시 기사에게 목적지를 알려주고 이동하는 상황', '택시', '택시 기사', '목적지까지 안전하게 도착하기', 2, '교통', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_006', '식당에서 음식 주문하기', '식당에서 메뉴를 보고 음식을 주문하는 상황', '식당', '웨이터', '원하는 음식 주문 완료하기', 1, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_007', '약국에서 약 구매하기', '약국에서 약사와 상담 후 필요한 약을 구매하는 상황', '약국', '약사', '증상에 맞는 약 구매하기', 2, '의료', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_008', '우체국에서 택배 보내기', '우체국에서 택배를 보내기 위해 접수하는 상황', '우체국', '우체국 직원', '택배 발송 완료하기', 2, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_009', '헬스장 등록하기', '헬스장에서 회원 등록 및 이용 안내를 받는 상황', '헬스장', '트레이너', '헬스장 등록 완료하기', 2, '운동', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_010', '미용실 예약하기', '미용실에 전화로 예약하는 상황', '미용실', '미용사', '원하는 날짜와 시간에 예약하기', 1, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_011', '부동산에서 집 알아보기', '부동산 중개인과 원룸이나 아파트를 알아보는 상황', '부동산', '공인중개사', '조건에 맞는 매물 찾기', 3, '주거', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_012', '도서관에서 책 대출하기', '도서관 사서에게 책 대출 신청을 하는 상황', '도서관', '사서', '원하는 책 대출하기', 1, '문화', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_013', '통신사에서 요금제 변경하기', '통신사 매장에서 휴대폰 요금제를 변경하는 상황', '통신사 매장', '상담원', '적합한 요금제로 변경하기', 3, '통신', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_014', '편의점에서 택배 찾기', '편의점에서 도착한 택배를 찾는 상황', '편의점', '점원', '택배 수령하기', 1, '일상생활', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_015', '영화관에서 티켓 구매하기', '영화관 매표소에서 영화 티켓을 구매하는 상황', '영화관', '매표소 직원', '원하는 영화 티켓 구매하기', 1, '문화', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_016', '관공서에서 민원 서류 발급받기', '주민센터에서 필요한 서류를 발급받는 상황', '주민센터', '공무원', '필요한 서류 발급받기', 3, '행정', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_017', '호텔 체크인하기', '호텔 프론트에서 체크인 절차를 진행하는 상황', '호텔', '프론트 직원', '체크인 완료하기', 2, '여행', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_018', '백화점에서 환불하기', '백화점 고객센터에서 구매한 제품을 환불하는 상황', '백화점', '고객센터 직원', '환불 처리 완료하기', 2, '쇼핑', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_019', '자동차 정비소 방문하기', '자동차 정비소에서 차량 점검을 요청하는 상황', '정비소', '정비사', '차량 점검 예약하기', 2, '자동차', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_020', '회사 면접 보기', '회사에서 채용 면접을 보는 상황', '회사', '면접관', '자기소개 및 질문에 답변하기', 4, '취업', '2026-01-20 22:02:18.05884+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_021', '세탁소에 옷 맡기기', '세탁소에서 옷을 맡기고 찾는 날짜를 정하는 상황', '세탁소', '세탁소 직원', '세탁물 접수 완료하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_022', '피부과 진료 받기', '피부과에서 피부 상태를 진료받는 상황', '피부과', '의사', '피부 문제 진단받기', 2, '의료', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_023', '안경점에서 안경 맞추기', '안경점에서 시력 검사 후 안경을 맞추는 상황', '안경점', '안경사', '적합한 안경 구매하기', 2, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_024', '문구점에서 학용품 구매하기', '문구점에서 필요한 학용품을 찾아 구매하는 상황', '문구점', '점원', '필요한 학용품 구매하기', 1, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_025', '공항에서 체크인하기', '공항 카운터에서 항공권 체크인을 하는 상황', '공항', '항공사 직원', '탑승 수속 완료하기', 3, '여행', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_026', '렌터카 대여하기', '렌터카 업체에서 차량을 대여하는 상황', '렌터카 업체', '상담원', '차량 대여 계약 완료하기', 3, '교통', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_027', '수영장 이용 등록하기', '수영장에서 회원 등록 및 이용 방법을 안내받는 상황', '수영장', '안내 직원', '수영장 등록 완료하기', 2, '운동', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_028', '옷 가게에서 쇼핑하기', '옷 가게에서 원하는 옷을 찾고 시착하는 상황', '옷 가게', '매장 직원', '마음에 드는 옷 구매하기', 1, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_029', 'PC방 이용하기', 'PC방에서 자리를 배정받고 시간을 등록하는 상황', 'PC방', '알바생', 'PC방 이용 시작하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_030', '노래방 예약하기', '노래방에서 방을 예약하고 이용하는 상황', '노래방', '카운터 직원', '노래방 룸 예약하기', 1, '문화', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_031', '보험 상담 받기', '보험사에서 보험 상품에 대해 상담받는 상황', '보험사', '보험 설계사', '적합한 보험 상품 알아보기', 4, '금융', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_032', '동물병원 방문하기', '반려동물을 데리고 동물병원에서 진료받는 상황', '동물병원', '수의사', '반려동물 진료 완료하기', 2, '의료', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_033', '빵집에서 빵 주문하기', '빵집에서 원하는 빵을 고르고 주문하는 상황', '빵집', '점원', '원하는 빵 구매하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_034', '전자제품 AS 센터 방문하기', 'AS 센터에서 고장난 전자제품을 수리 접수하는 상황', 'AS 센터', '상담원', '제품 수리 접수하기', 2, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_035', '꽃집에서 꽃다발 주문하기', '꽃집에서 행사용 꽃다발을 주문하는 상황', '꽃집', '플로리스트', '원하는 꽃다발 주문하기', 2, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_036', '학원 등록하기', '학원에서 수강 과목을 등록하는 상황', '학원', '상담 선생님', '수강 신청 완료하기', 2, '교육', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_037', '치과 예약하기', '치과에 전화로 진료 예약을 하는 상황', '치과', '치과 직원', '진료 예약 완료하기', 2, '의료', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_038', '네일샵 예약하기', '네일샵에서 네일 시술 예약을 하는 상황', '네일샵', '네일 아티스트', '네일 시술 예약하기', 2, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_039', '주차장 정기권 구매하기', '주차장 관리실에서 정기권을 구매하는 상황', '주차장', '관리원', '주차 정기권 구매하기', 2, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_040', '스터디카페 이용하기', '스터디카페에서 자리를 예약하고 이용하는 상황', '스터디카페', '직원', '스터디 공간 이용하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_041', '배달 음식 주문하기', '전화로 배달 음식을 주문하는 상황', '집', '식당 직원', '배달 주문 완료하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_042', '보청기 센터 방문하기', '보청기 센터에서 청력 검사 후 보청기를 맞추는 상황', '보청기 센터', '청각사', '보청기 구매하기', 3, '의료', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_043', '키즈카페 이용하기', '키즈카페에서 아이와 함께 입장하고 이용하는 상황', '키즈카페', '직원', '아이와 함께 이용하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_044', '요가 센터 등록하기', '요가 센터에서 수업을 등록하는 상황', '요가 센터', '강사', '요가 수업 등록하기', 2, '운동', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_045', '애견 미용실 예약하기', '애견 미용실에서 반려견 미용을 예약하는 상황', '애견 미용실', '미용사', '반려견 미용 예약하기', 2, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_046', '사진관에서 증명사진 찍기', '사진관에서 증명사진을 촬영하는 상황', '사진관', '사진사', '증명사진 촬영하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_047', '중고 거래 장터 이용하기', '중고 거래 장터에서 물건을 사고파는 상황', '중고 거래 장터', '판매자/구매자', '거래 완료하기', 2, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_048', '클리닉에서 건강검진 받기', '종합병원이나 클리닉에서 건강검진을 받는 상황', '클리닉', '간호사', '건강검진 완료하기', 3, '의료', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_049', '골프 연습장 등록하기', '골프 연습장에서 회원 등록을 하는 상황', '골프 연습장', '직원', '골프 연습장 등록하기', 2, '운동', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_050', '펜션 예약하기', '전화나 방문으로 펜션을 예약하는 상황', '펜션', '주인', '펜션 예약 완료하기', 2, '여행', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_051', '세차장 이용하기', '자동 세차장이나 손세차장을 이용하는 상황', '세차장', '직원', '차량 세차 완료하기', 1, '자동차', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_052', '독서실 등록하기', '독서실에서 좌석을 배정받고 등록하는 상황', '독서실', '관리자', '독서실 등록하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_053', '안마 의자 체험하기', '가전 매장에서 안마 의자를 체험하는 상황', '가전 매장', '판매원', '안마 의자 체험하기', 1, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_054', '신발 수선소 방문하기', '신발 수선소에서 신발을 수선 맡기는 상황', '신발 수선소', '수선공', '신발 수선 맡기기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_055', '이사 센터 견적 받기', '이사 센터에서 이사 비용 견적을 받는 상황', '이사 센터', '상담원', '이사 견적 받기', 3, '주거', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_056', '온라인 쇼핑몰 전화 상담하기', '온라인 쇼핑몰 고객센터에 전화로 문의하는 상황', '온라인 쇼핑몰', '상담원', '문의 사항 해결하기', 2, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_057', '인테리어 업체 상담하기', '인테리어 업체에서 집 인테리어 상담을 받는 상황', '인테리어 업체', '디자이너', '인테리어 계획 세우기', 4, '주거', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_058', '카센터에서 타이어 교체하기', '카센터에서 타이어 교체 서비스를 받는 상황', '카센터', '정비사', '타이어 교체 완료하기', 2, '자동차', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_059', '복권 판매점에서 복권 구매하기', '복권 판매점에서 로또나 복권을 구매하는 상황', '복권 판매점', '점원', '복권 구매하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_060', '동사무소에서 전입신고하기', '동사무소에서 전입신고 절차를 진행하는 상황', '동사무소', '공무원', '전입신고 완료하기', 3, '행정', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_061', '패스트푸드점에서 주문하기', '패스트푸드점에서 키오스크나 카운터로 주문하는 상황', '패스트푸드점', '직원', '음식 주문하고 받기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_062', '안마 의자 매장 방문하기', '안마 의자 전문 매장에서 상담받는 상황', '안마 의자 매장', '판매원', '안마 의자 상담받기', 2, '쇼핑', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_063', '운전면허 학원 등록하기', '운전면허 학원에서 등록하고 일정을 정하는 상황', '운전면허 학원', '상담원', '운전 학원 등록하기', 3, '교육', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_064', '여권 발급 신청하기', '여권 발급 기관에서 여권을 신청하는 상황', '여권 사무소', '공무원', '여권 발급 신청하기', 3, '행정', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_065', '공연 티켓 예매하기', '공연장이나 인터파크 등에서 티켓을 예매하는 상황', '티켓 판매처', '상담원', '공연 티켓 예매하기', 2, '문화', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_066', '피트니스 PT 상담받기', '헬스장에서 개인 트레이닝 상담을 받는 상황', '헬스장', 'PT 트레이너', 'PT 프로그램 상담받기', 3, '운동', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_067', '전시회 관람하기', '전시회장에서 티켓을 구매하고 관람하는 상황', '전시회장', '안내 직원', '전시회 관람하기', 2, '문화', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_068', '핸드폰 수리하기', '핸드폰 수리 센터에서 고장난 휴대폰을 수리 맡기는 상황', '수리 센터', '기술자', '휴대폰 수리 접수하기', 2, '통신', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_069', '반찬 가게에서 반찬 구매하기', '반찬 가게에서 원하는 반찬을 골라 구매하는 상황', '반찬 가게', '점원', '반찬 구매하기', 1, '일상생활', '2026-01-20 22:04:34.383222+09');
INSERT INTO public.scenario_definitions VALUES ('scenario_070', '공인중개사에서 상가 알아보기', '공인중개사 사무실에서 상가를 알아보는 상황', '공인중개사', '중개사', '상가 매물 알아보기', 4, '주거', '2026-01-20 22:04:34.383222+09');


