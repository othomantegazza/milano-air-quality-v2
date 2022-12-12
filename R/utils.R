# df_to_js <- function(x, ...){
#   
#   const_name <- ensym(x)
#   
#   json_data <- jsonlite::toJSON(x, ...)
#   
#   htmltools::tags$script(paste0("const ", const_name, " = ", json_data, ";"))
# }

scale_pollutant <- 
  function(data, eu_limits, ...) {
    
    data <-
      data %>% 
      group_by(date) %>% 
      summarise(
        across(
          .cols = valore,
          .fns = ~median(., na.rm = T)
        )
      ) %>% 
      mutate(scaled = valore/eu_limits) %>% 
      ungroup() %>% 
      as_tsibble(index = 'date') %>% 
      fill_gaps() %>% 
      fill(valore, scaled, .direction = 'down') %>% 
      as_tibble()
    
    return(data)
  }

smooth_air_q <- 
  function(data, ...) {
    
    date_range <- range(air_q$date)
    all_dates <-  seq.Date(date_range[1], date_range[2], by = 1)
    conf_95 <- 1.96
    
    loess_fit <- 
      data %>% 
      mutate(date = as.numeric(date)) %>%
      {
        loess(formula = valore ~ date,
              data = .,
              span = loess_span)
      }
    
    dates_for_fit <- 
      tibble(
        date = as.numeric(all_dates)
      )
    
    out <- 
      loess_fit %>% 
      {
        augment(x = .,
                newdata = dates_for_fit,
                se_fit = TRUE)
      } %>%  
      mutate(
        low_95 = .fitted - .se.fit * conf_95,
        high_95 = .fitted + .se.fit * conf_95,
      ) %>% 
      mutate(date = as_date(date)) %>% 
      select(-.fitted, -.se.fit)
    
    return(out)
  } 
