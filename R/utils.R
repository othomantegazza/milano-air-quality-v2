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
