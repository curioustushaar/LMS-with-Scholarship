-- Quick test to see certificate with all joins
SELECT 
    c.id,
    c.certificate_number,
    c.user_id,
    c.course_id,
    c.domain,
    c.issued_at,
    c.sent_status,
    u.id as user_id_check,
    u.full_name,
    u.email,
    u.role,
    co.id as course_id_check,
    co.title,
    co.description
FROM certificates c
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN courses co ON c.course_id = co.id
ORDER BY c.issued_at DESC;
