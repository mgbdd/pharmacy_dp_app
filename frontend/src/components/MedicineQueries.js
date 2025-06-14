              <table>
                <thead>
                  <tr>
                    {Object.keys(medicineDetails[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {medicineDetails.map((medicine, index) => (
                    <tr key={index}>
                      {Object.values(medicine).map((value, idx) => (
                        <td key={idx}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
