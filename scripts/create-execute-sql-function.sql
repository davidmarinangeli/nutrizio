CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  EXECUTE sql_query;
END;
$function$;
