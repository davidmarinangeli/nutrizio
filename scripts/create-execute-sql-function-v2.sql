CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER -- This is the crucial addition
AS $function$
BEGIN
  EXECUTE sql_query;
END;
$function$;

-- Grant execution rights to the anon and authenticated roles
-- This ensures your application can call the function
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO anon, authenticated;
