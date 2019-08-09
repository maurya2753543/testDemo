create proc cheapestAndCostliestFlight @flight_date date
as
begin
select top 1 f.airline_id,f.FR_id, f.Flight_date,f.timing
from flights f
inner join FR_id fr
on f.FR_id= fr.FR_id
where f.flight_date = @flight_date
order by fr.Base_fare

select top 1 fr.FR_id,fr.flight_id, fr.route_id,fr.Base_fare
from flights f
inner join FR_id fr
on f.FR_id = fr.Fr_id
where f.flight_date = @flight_date
order by fr.Base_fare desc;

end 

-- exec cheapestAndCostliestFlight @flight_date = '2019-01-01';
 